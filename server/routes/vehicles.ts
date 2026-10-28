import { Router, Request, Response, NextFunction } from 'express';
import TransportVehicle from '../models/TransportVehicle';

const router = Router();

// GET /api/vehicles - list all transport vehicles
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};

    if (status) {
      filter.status = String(status);
    }

    const vehicles = await TransportVehicle.find(filter).sort({ vehicleId: 1 });
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/vehicles/:id - get vehicle by vehicleId or _id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const vehicle = await TransportVehicle.findOne({
      $or: [{ vehicleId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: { message: `Transport vehicle with identifier '${id}' not found.`, statusCode: 404 },
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
