import { Router, Request, Response, NextFunction } from 'express';
import Booking, { BookingStatus } from '../models/Booking';
import ColdStorage from '../models/ColdStorage';
import TransportVehicle from '../models/TransportVehicle';

const router = Router();

// GET /api/bookings - list all bookings with optional filtering
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { farmerId, storageId, status } = req.query;
    const filter: Record<string, unknown> = {};

    if (farmerId) filter.farmerId = String(farmerId);
    if (storageId) filter.storageId = String(storageId);
    if (status) filter.status = String(status);

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/:id - get booking by bookingId or _id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({
      $or: [{ bookingId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: `Booking with identifier '${id}' not found.`, statusCode: 404 },
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings - create a new booking
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      bookingId,
      farmerId,
      produceId,
      storageId,
      vehicleId,
      quantityKg,
      pickupLocation,
      destination,
      status,
    } = req.body;

    if (!farmerId || !produceId || !storageId || quantityKg === undefined || !pickupLocation || !destination) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            'Missing required fields: farmerId, produceId, storageId, quantityKg, pickupLocation, and destination are required.',
          statusCode: 400,
        },
      });
    }

    const requestedQty = Number(quantityKg);
    if (isNaN(requestedQty) || requestedQty <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'quantityKg must be a positive number greater than 0.',
          statusCode: 400,
        },
      });
    }

    // 1. Verify storage exists
    const storage = await ColdStorage.findOne({ storageId });
    if (!storage) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Storage facility with identifier '${storageId}' not found.`,
          statusCode: 404,
        },
      });
    }

    // 2. Prevent duplicate active booking on the same produce batch
    const existingActiveBooking = await Booking.findOne({
      produceId,
      status: { $in: ['pending', 'confirmed', 'in_transit'] },
    });
    if (existingActiveBooking) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Produce batch '${produceId}' already has an active reservation (${existingActiveBooking.bookingId}) at ${existingActiveBooking.storageId}.`,
          statusCode: 400,
        },
      });
    }

    // 3. Authoritative capacity check before atomic deduction
    if (storage.availableCapacityKg < requestedQty) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Storage facility '${storage.name}' only has ${storage.availableCapacityKg.toLocaleString()} kg capacity available, but ${requestedQty.toLocaleString()} kg was requested.`,
          statusCode: 400,
        },
      });
    }

    // 4. Atomically deduct capacity in MongoDB to prevent race conditions / concurrent overbooking
    const updatedStorage = await ColdStorage.findOneAndUpdate(
      {
        storageId,
        availableCapacityKg: { $gte: requestedQty },
      },
      {
        $inc: {
          occupiedCapacityKg: requestedQty,
          availableCapacityKg: -requestedQty,
        },
      },
      { new: true }
    );

    if (!updatedStorage) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Facility '${storage.name}' no longer has sufficient capacity available due to concurrent reservations.`,
          statusCode: 400,
        },
      });
    }

    // Synchronize facility status based on remaining available capacity
    if (updatedStorage.availableCapacityKg <= 0 && updatedStorage.status === 'available') {
      await ColdStorage.updateOne({ storageId }, { status: 'full' });
    } else if (updatedStorage.availableCapacityKg > 0 && updatedStorage.status === 'full') {
      await ColdStorage.updateOne({ storageId }, { status: 'available' });
    }

    const finalBookingId = bookingId || `BK-${Date.now().toString().slice(-6)}`;

    // 5. Persist the Booking document
    let booking;
    try {
      booking = await Booking.create({
        bookingId: finalBookingId,
        farmerId,
        produceId,
        storageId,
        vehicleId,
        quantityKg: requestedQty,
        pickupLocation,
        destination,
        status: (status as BookingStatus) || 'confirmed',
      });
    } catch (bookingError) {
      // Rollback atomically if booking document creation fails
      await ColdStorage.findOneAndUpdate(
        { storageId },
        {
          $inc: {
            occupiedCapacityKg: -requestedQty,
            availableCapacityKg: requestedQty,
          },
          $set: { status: 'available' },
        }
      );
      throw bookingError;
    }

    res.status(201).json({
      success: true,
      data: booking,
      storage: {
        storageId: updatedStorage.storageId,
        availableCapacityKg: updatedStorage.availableCapacityKg,
        occupiedCapacityKg: updatedStorage.occupiedCapacityKg,
        status: updatedStorage.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Allowed status transition map (forward-only progression + cancellation)
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_transit', 'cancelled'],
  in_transit: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

// PATCH /api/bookings/:id/status - update booking status
router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: BookingStatus[] = ['pending', 'confirmed', 'in_transit', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          statusCode: 400,
        },
      });
    }

    const booking = await Booking.findOne({
      $or: [{ bookingId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: `Booking with identifier '${id}' not found.`, statusCode: 404 },
      });
    }

    // 1. Prevent duplicate status transition
    if (booking.status === status) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Booking '${booking.bookingId}' is already in '${status}' status.`,
          statusCode: 400,
        },
      });
    }

    // 2. Prevent transitions out of terminal states (completed or cancelled)
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: {
          message: `Cannot change status of a ${booking.status} booking. '${booking.bookingId}' is in terminal state.`,
          statusCode: 400,
        },
      });
    }

    // 3. Enforce valid state progression
    const allowed = ALLOWED_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(status as BookingStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid status transition from '${booking.status}' to '${status}'. Allowed transitions: ${allowed.join(', ') || 'none'}.`,
          statusCode: 400,
        },
      });
    }

    const previousStatus = booking.status;
    booking.status = status as BookingStatus;
    await booking.save();

    // 4. If cancelled from active status, release storage capacity back to available
    if (status === 'cancelled') {
      await ColdStorage.findOneAndUpdate(
        { storageId: booking.storageId },
        {
          $inc: {
            occupiedCapacityKg: -booking.quantityKg,
            availableCapacityKg: booking.quantityKg,
          },
          $set: { status: 'available' },
        }
      );
    }

    // 5. Synchronize assigned transport vehicle status if assigned
    if (booking.vehicleId) {
      if (status === 'in_transit') {
        await TransportVehicle.updateOne(
          { vehicleId: booking.vehicleId },
          {
            $set: {
              status: 'in_transit',
              bookingId: booking.bookingId,
              destination: booking.destination,
            },
          }
        );
      } else if (status === 'completed') {
        await TransportVehicle.updateOne(
          { vehicleId: booking.vehicleId },
          {
            $set: {
              status: 'available',
              currentLocation: booking.destination,
            },
            $unset: {
              bookingId: 1,
              destination: 1,
            },
          }
        );
      } else if (status === 'cancelled') {
        await TransportVehicle.updateOne(
          { vehicleId: booking.vehicleId },
          {
            $set: {
              status: 'available',
            },
            $unset: {
              bookingId: 1,
              destination: 1,
            },
          }
        );
      }
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
