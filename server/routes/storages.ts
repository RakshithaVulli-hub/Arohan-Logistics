import { Router, Request, Response, NextFunction } from 'express';
import ColdStorage from '../models/ColdStorage';

const router = Router();

// GET /api/storages - list all cold storages
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { crop, district, availableOnly } = req.query;
    const filter: Record<string, unknown> = {};

    if (crop) {
      filter.supportedCrops = new RegExp(String(crop), 'i');
    }
    if (district) {
      filter.district = new RegExp(String(district), 'i');
    }
    if (availableOnly === 'true') {
      filter.availableCapacityKg = { $gt: 0 };
      filter.status = 'available';
    }

    const storages = await ColdStorage.find(filter).sort({ name: 1 });

    // Ensure availableCapacityKg and status are synchronized
    const normalized = storages.map((s) => {
      const avail = s.capacityKg - s.occupiedCapacityKg;
      return {
        ...s.toObject(),
        availableCapacityKg: avail,
        status: avail <= 0 ? 'full' : s.status === 'full' ? 'available' : s.status,
      };
    });

    res.status(200).json({
      success: true,
      count: normalized.length,
      data: normalized,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/storages/:id - get storage by storageId or _id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const storage = await ColdStorage.findOne({
      $or: [{ storageId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
    });

    if (!storage) {
      return res.status(404).json({
        success: false,
        error: { message: `Cold storage with identifier '${id}' not found.`, statusCode: 404 },
      });
    }

    const avail = storage.capacityKg - storage.occupiedCapacityKg;
    const obj = {
      ...storage.toObject(),
      availableCapacityKg: avail,
      status: avail <= 0 ? 'full' : storage.status === 'full' ? 'available' : storage.status,
    };

    res.status(200).json({
      success: true,
      data: obj,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
