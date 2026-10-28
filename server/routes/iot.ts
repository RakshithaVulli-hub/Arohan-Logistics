import { Router, Request, Response, NextFunction } from 'express';
import IoTReading, { AlertStatus } from '../models/IoTReading';
import ColdStorage from '../models/ColdStorage';

const router = Router();

// GET /api/iot/readings - get latest readings with optional limit
router.get('/readings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const readings = await IoTReading.find().sort({ recordedAt: -1 }).limit(limit);

    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/iot/readings/:storageId - get readings for a specific cold storage
router.get('/readings/:storageId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { storageId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const readings = await IoTReading.find({ storageId })
      .sort({ recordedAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      storageId,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/iot/readings - record a new telemetry reading
router.post('/readings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sensorId, storageId, temperature, humidity, alertStatus, recordedAt } = req.body;

    if (!sensorId || !storageId || temperature === undefined || humidity === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: sensorId, storageId, temperature, and humidity are required.',
          statusCode: 400,
        },
      });
    }

    const numTemp = Number(temperature);
    const numHum = Number(humidity);

    if (isNaN(numTemp) || isNaN(numHum) || numHum < 0 || numHum > 100) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid reading values: temperature must be numeric and humidity must be between 0 and 100.',
          statusCode: 400,
        },
      });
    }

    let resolvedAlertStatus: AlertStatus = 'normal';
    if (alertStatus && ['normal', 'warning', 'critical'].includes(alertStatus)) {
      resolvedAlertStatus = alertStatus as AlertStatus;
    } else {
      // Evaluate against facility threshold specifications if storage exists
      const storage = await ColdStorage.findOne({ storageId });
      if (storage) {
        let isTempBreached = false;
        let isHumBreached = false;

        if (storage.minimumTemperature !== undefined && storage.maximumTemperature !== undefined) {
          if (numTemp < storage.minimumTemperature || numTemp > storage.maximumTemperature) {
            isTempBreached = true;
          }
        }

        if (storage.humidityRange) {
          const match = storage.humidityRange.match(/(\d+)\s*-\s*(\d+)/);
          if (match) {
            const minH = Number(match[1]);
            const maxH = Number(match[2]);
            if (numHum < minH || numHum > maxH) {
              isHumBreached = true;
            }
          }
        }

        if (isTempBreached && isHumBreached) {
          resolvedAlertStatus = 'critical';
        } else if (isTempBreached || isHumBreached) {
          resolvedAlertStatus = 'warning';
        }
      }
    }

    const reading = await IoTReading.create({
      sensorId: String(sensorId).trim(),
      storageId: String(storageId).trim(),
      temperature: numTemp,
      humidity: numHum,
      alertStatus: resolvedAlertStatus,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    });

    res.status(201).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
