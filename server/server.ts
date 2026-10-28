import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Route imports
import farmersRouter from './routes/farmers';
import produceRouter from './routes/produce';
import storagesRouter from './routes/storages';
import vehiclesRouter from './routes/vehicles';
import bookingsRouter from './routes/bookings';
import iotRouter from './routes/iot';
import marketPricesRouter from './routes/marketPrices';
import aiPredictionsRouter from './routes/aiPredictions';

// Middleware imports
import { errorHandler } from './middleware/errorHandler';

// Models for stats endpoint
import Farmer from './models/Farmer';
import Produce from './models/Produce';
import ColdStorage from './models/ColdStorage';
import TransportVehicle from './models/TransportVehicle';
import Booking from './models/Booking';
import IoTReading from './models/IoTReading';
import MarketPrice from './models/MarketPrice';
import AiPrediction from './models/AiPrediction';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI;

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || origin === CLIENT_ORIGIN || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local development demonstration
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// System Health & MongoDB Connection Status
app.get('/api/health', (req: Request, res: Response) => {
  const stateCode = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = states[stateCode] || 'unknown';
  const isConnected = stateCode === 1;

  res.status(isConnected ? 200 : 503).json({
    api: isConnected ? 'ok' : 'degraded',
    database: state,
    status: isConnected ? 'healthy' : 'degraded',
    details: {
      connected: isConnected,
      name: mongoose.connection.name || 'none',
      host: mongoose.connection.host || 'none',
    },
    timestamp: new Date().toISOString(),
  });
});

// Database Explorer / Collection Stats Endpoint
app.get('/api/stats', async (req: Request, res: Response, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'Database is currently disconnected. Cannot retrieve collection statistics.',
          statusCode: 503,
        },
      });
    }

    const [
      farmersCount,
      produceCount,
      storagesCount,
      vehiclesCount,
      bookingsCount,
      iotReadingsCount,
      marketPricesCount,
      aiPredictionsCount,
    ] = await Promise.all([
      Farmer.countDocuments(),
      Produce.countDocuments(),
      ColdStorage.countDocuments(),
      TransportVehicle.countDocuments(),
      Booking.countDocuments(),
      IoTReading.countDocuments(),
      MarketPrice.countDocuments(),
      AiPrediction.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      collections: {
        farmers: farmersCount,
        produce: produceCount,
        coldStorages: storagesCount,
        transportVehicles: vehiclesCount,
        bookings: bookingsCount,
        iotReadings: iotReadingsCount,
        marketPrices: marketPricesCount,
        aiPredictions: aiPredictionsCount,
      },
      totalRecords:
        farmersCount +
        produceCount +
        storagesCount +
        vehiclesCount +
        bookingsCount +
        iotReadingsCount +
        marketPricesCount +
        aiPredictionsCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// API Routes
app.use('/api/farmers', farmersRouter);
app.use('/api/produce', produceRouter);
app.use('/api/storages', storagesRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/iot', iotRouter);
app.use('/api/market-prices', marketPricesRouter);
app.use('/api/ai-predictions', aiPredictionsRouter);

// 404 Handler for undefined API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `API endpoint '${req.originalUrl}' not found.`,
      statusCode: 404,
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);

const startServer = async () => {
  if (!MONGODB_URI) {
    console.error(
      '❌ MONGODB_URI is not set in environment. Please configure server/.env.'
    );
    process.exit(1);
  }

  try {
    console.log(`🔄 Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected successfully: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err: any) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('⚠️ Please ensure local MongoDB Community Server is installed and running on port 27017.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Micro Cold Chain Logistics API listening on port ${PORT}`);
    console.log(`📡 CORS allowed for: ${CLIENT_ORIGIN}`);
    console.log(`🩺 Health check available at: http://localhost:${PORT}/api/health`);
  });
};

startServer();

export default app;
