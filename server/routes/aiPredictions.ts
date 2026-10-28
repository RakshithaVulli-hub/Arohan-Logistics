import { Router, Request, Response, NextFunction } from 'express';
import AiPrediction from '../models/AiPrediction';

const router = Router();

// GET /api/ai-predictions - list predictions, optionally by produceId
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { produceId } = req.query;
    const filter: Record<string, unknown> = {};

    if (produceId) filter.produceId = String(produceId);

    const predictions = await AiPrediction.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: predictions.length,
      note: 'All AI predictions are algorithmic simulations generated for demonstration purposes.',
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai-predictions - record a new AI prediction result
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      predictionId,
      produceId,
      modelType,
      qualityGrade,
      freshnessPercentage,
      spoilageRiskPercentage,
      confidenceScore,
      recommendation,
    } = req.body;

    if (
      !produceId ||
      !modelType ||
      !qualityGrade ||
      freshnessPercentage === undefined ||
      spoilageRiskPercentage === undefined ||
      confidenceScore === undefined ||
      !recommendation
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            'Missing required fields: produceId, modelType, qualityGrade, freshnessPercentage, spoilageRiskPercentage, confidenceScore, and recommendation are required.',
          statusCode: 400,
        },
      });
    }

    const finalPredictionId =
      predictionId || `PRED-${Date.now().toString().slice(-6)}`;

    const prediction = await AiPrediction.create({
      predictionId: finalPredictionId,
      produceId,
      modelType,
      qualityGrade,
      freshnessPercentage: Number(freshnessPercentage),
      spoilageRiskPercentage: Number(spoilageRiskPercentage),
      confidenceScore: Number(confidenceScore),
      recommendation,
      isSimulated: true,
    });

    res.status(201).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
