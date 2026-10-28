import { Router, Request, Response, NextFunction } from 'express';
import Produce from '../models/Produce';

const router = Router();

// GET /api/produce - list all produce, optional filter by farmerId or cropName
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { farmerId, cropName } = req.query;
    const filter: Record<string, unknown> = {};

    if (farmerId) filter.farmerId = String(farmerId);
    if (cropName) filter.cropName = new RegExp(String(cropName), 'i');

    const produce = await Produce.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: produce.length,
      data: produce,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/produce/:id - get produce by produceId or _id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await Produce.findOne({
      $or: [{ produceId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { message: `Produce with identifier '${id}' not found.`, statusCode: 404 },
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/produce - register new produce
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      produceId,
      farmerId,
      cropName,
      quantityKg,
      harvestDate,
      location,
      qualityGrade,
      freshnessPercentage,
      spoilageRiskPercentage,
    } = req.body;

    if (!farmerId || !cropName || quantityKg === undefined || !harvestDate || !location) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: farmerId, cropName, quantityKg, harvestDate, and location are required.',
          statusCode: 400,
        },
      });
    }

    // Generate unique produceId if not supplied
    const finalProduceId =
      produceId || `PROD-${Date.now().toString().slice(-6)}`;

    const newItem = await Produce.create({
      produceId: finalProduceId,
      farmerId,
      cropName,
      quantityKg: Number(quantityKg),
      harvestDate: new Date(harvestDate),
      location,
      qualityGrade,
      freshnessPercentage: freshnessPercentage !== undefined ? Number(freshnessPercentage) : undefined,
      spoilageRiskPercentage:
        spoilageRiskPercentage !== undefined ? Number(spoilageRiskPercentage) : undefined,
    });

    res.status(201).json({
      success: true,
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
