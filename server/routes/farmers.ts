import { Router, Request, Response, NextFunction } from 'express';
import Farmer from '../models/Farmer';

const router = Router();

// GET /api/farmers - list all farmers
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farmers = await Farmer.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: farmers.length,
      data: farmers,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/farmers/:id - get farmer by farmerId or _id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const farmer = await Farmer.findOne({
      $or: [{ farmerId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])],
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: { message: `Farmer with identifier '${id}' not found.`, statusCode: 404 },
      });
    }

    res.status(200).json({
      success: true,
      data: farmer,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/farmers - create a farmer
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { farmerId, name, phone, village, district, landArea, crops } = req.body;

    if (!farmerId || !name || !village || !district || landArea === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: farmerId, name, village, district, and landArea are required.',
          statusCode: 400,
        },
      });
    }

    const farmer = await Farmer.create({
      farmerId,
      name,
      phone,
      village,
      district,
      landArea: Number(landArea),
      crops: Array.isArray(crops) ? crops : [],
    });

    res.status(201).json({
      success: true,
      data: farmer,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/farmers/:id - update a farmer
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, phone, village, district, landArea, crops } = req.body;

    const farmer = await Farmer.findOneAndUpdate(
      { $or: [{ farmerId: id }, ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])] },
      {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(village && { village }),
        ...(district && { district }),
        ...(landArea !== undefined && { landArea: Number(landArea) }),
        ...(Array.isArray(crops) && { crops }),
      },
      { new: true, runValidators: true }
    );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: { message: `Farmer with identifier '${id}' not found.`, statusCode: 404 },
      });
    }

    res.status(200).json({
      success: true,
      data: farmer,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
