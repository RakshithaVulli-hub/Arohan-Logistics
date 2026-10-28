import { Router, Request, Response, NextFunction } from 'express';
import MarketPrice from '../models/MarketPrice';

const router = Router();

// GET /api/market-prices - retrieve market prices (simulated demo records)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cropName, district } = req.query;
    const filter: Record<string, unknown> = {};

    if (cropName) filter.cropName = new RegExp(String(cropName), 'i');
    if (district) filter.district = new RegExp(String(district), 'i');

    const prices = await MarketPrice.find(filter).sort({ recordedAt: -1 });

    res.status(200).json({
      success: true,
      count: prices.length,
      isSimulated: true,
      note: 'Market prices in this endpoint are simulated demonstration figures and not live APMC feed.',
      data: prices,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
