import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Farmer from './models/Farmer';
import Produce from './models/Produce';
import ColdStorage from './models/ColdStorage';
import TransportVehicle from './models/TransportVehicle';
import Booking from './models/Booking';
import IoTReading from './models/IoTReading';
import MarketPrice from './models/MarketPrice';
import AiPrediction from './models/AiPrediction';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in server/.env. Cannot run seed script.');
  process.exit(1);
}

// 1. 5 Fictional Farmers in Andhra Pradesh
const SEED_FARMERS = [
  {
    farmerId: 'F-1001',
    name: 'Ravi Kumar',
    phone: '+91 90000 11001',
    village: 'Pedakakani',
    district: 'Guntur',
    landArea: 4.5,
    crops: ['Tomato', 'Chilli (Green)'],
  },
  {
    farmerId: 'F-1002',
    name: 'Lakshmi Devi',
    phone: '+91 90000 11002',
    village: 'Angalakuduru',
    district: 'Tenali (Guntur)',
    landArea: 6.2,
    crops: ['Mango', 'Guava'],
  },
  {
    farmerId: 'F-1003',
    name: 'Suresh Varma',
    phone: '+91 90000 11003',
    village: 'Gollapudi',
    district: 'Krishna (Vijayawada)',
    landArea: 3.8,
    crops: ['Banana', 'Papaya'],
  },
  {
    farmerId: 'F-1004',
    name: 'Anitha Reddy',
    phone: '+91 90000 11004',
    village: 'Vatluru',
    district: 'Eluru',
    landArea: 5.0,
    crops: ['Tomato', 'Leafy Vegetables'],
  },
  {
    farmerId: 'F-1005',
    name: 'Ramesh Naidu',
    phone: '+91 90000 11005',
    village: 'Mandadam',
    district: 'Amaravati',
    landArea: 4.0,
    crops: ['Onion', 'Potato'],
  },
];

// 2. 4 Cold Storage Facilities
const SEED_COLD_STORAGES = [
  {
    storageId: 'CS-101',
    name: 'Vijayawada Central Cold Storage',
    location: 'Bhavanipuram Industrial Area',
    district: 'Krishna',
    capacityKg: 15000,
    occupiedCapacityKg: 10500,
    availableCapacityKg: 4500,
    supportedCrops: ['Banana', 'Mango', 'Apple', 'Tomato'],
    minimumTemperature: 4.0,
    maximumTemperature: 12.0,
    humidityRange: '75-90%',
    storageCostPerKg: 2.2,
    status: 'available',
  },
  {
    storageId: 'CS-102',
    name: 'Guntur Agro Freeze Hub',
    location: 'Guntur Auto Nagar, NH-16',
    district: 'Guntur',
    capacityKg: 10000,
    occupiedCapacityKg: 7200,
    availableCapacityKg: 2800,
    supportedCrops: ['Tomato', 'Chilli (Green)', 'Capsicum'],
    minimumTemperature: 6.0,
    maximumTemperature: 12.0,
    humidityRange: '80-92%',
    storageCostPerKg: 2.5,
    status: 'available',
  },
  {
    storageId: 'CS-103',
    name: 'Amaravati Micro Cold Vault',
    location: 'Seed Access Road, Rayapudi',
    district: 'Amaravati',
    capacityKg: 6000,
    occupiedCapacityKg: 2200,
    availableCapacityKg: 3800,
    supportedCrops: ['Tomato', 'Leafy Vegetables', 'Chilli (Green)'],
    minimumTemperature: 2.0,
    maximumTemperature: 10.0,
    humidityRange: '85-95%',
    storageCostPerKg: 2.0,
    status: 'available',
  },
  {
    storageId: 'CS-104',
    name: 'Tenali Rural Cooperative Cold Chain',
    location: 'Tenali Agricultural Market Yard',
    district: 'Guntur',
    capacityKg: 8000,
    occupiedCapacityKg: 6800,
    availableCapacityKg: 1200,
    supportedCrops: ['Mango', 'Banana', 'Tomato'],
    minimumTemperature: 8.0,
    maximumTemperature: 14.0,
    humidityRange: '80-90%',
    storageCostPerKg: 1.8,
    status: 'available',
  },
];

// 3. 10 Produce Records
const SEED_PRODUCE = [
  {
    produceId: 'PROD-001',
    farmerId: 'F-1001',
    cropName: 'Tomato',
    quantityKg: 500,
    harvestDate: new Date('2026-09-15'),
    location: 'Pedakakani Farm 4',
    qualityGrade: 'A',
    freshnessPercentage: 92,
    spoilageRiskPercentage: 18,
  },
  {
    produceId: 'PROD-002',
    farmerId: 'F-1002',
    cropName: 'Mango',
    quantityKg: 1200,
    harvestDate: new Date('2026-09-14'),
    location: 'Angalakuduru Orchard',
    qualityGrade: 'A',
    freshnessPercentage: 90,
    spoilageRiskPercentage: 22,
  },
  {
    produceId: 'PROD-003',
    farmerId: 'F-1003',
    cropName: 'Banana',
    quantityKg: 850,
    harvestDate: new Date('2026-09-13'),
    location: 'Gollapudi Plot 2',
    qualityGrade: 'A',
    freshnessPercentage: 94,
    spoilageRiskPercentage: 14,
  },
  {
    produceId: 'PROD-004',
    farmerId: 'F-1001',
    cropName: 'Chilli (Green)',
    quantityKg: 300,
    harvestDate: new Date('2026-09-16'),
    location: 'Pedakakani Farm 7',
    qualityGrade: 'B',
    freshnessPercentage: 88,
    spoilageRiskPercentage: 26,
  },
  {
    produceId: 'PROD-005',
    farmerId: 'F-1004',
    cropName: 'Tomato',
    quantityKg: 650,
    harvestDate: new Date('2026-09-16'),
    location: 'Vatluru Agri Block',
    qualityGrade: 'A',
    freshnessPercentage: 95,
    spoilageRiskPercentage: 12,
  },
  {
    produceId: 'PROD-006',
    farmerId: 'F-1004',
    cropName: 'Leafy Vegetables',
    quantityKg: 200,
    harvestDate: new Date('2026-09-17'),
    location: 'Vatluru Greenhouse',
    qualityGrade: 'A',
    freshnessPercentage: 98,
    spoilageRiskPercentage: 15,
  },
  {
    produceId: 'PROD-007',
    farmerId: 'F-1005',
    cropName: 'Onion',
    quantityKg: 1500,
    harvestDate: new Date('2026-09-10'),
    location: 'Mandadam Farm Area',
    qualityGrade: 'B',
    freshnessPercentage: 85,
    spoilageRiskPercentage: 20,
  },
  {
    produceId: 'PROD-008',
    farmerId: 'F-1005',
    cropName: 'Potato',
    quantityKg: 2000,
    harvestDate: new Date('2026-09-08'),
    location: 'Mandadam Drylands',
    qualityGrade: 'A',
    freshnessPercentage: 92,
    spoilageRiskPercentage: 10,
  },
  {
    produceId: 'PROD-009',
    farmerId: 'F-1002',
    cropName: 'Guava',
    quantityKg: 400,
    harvestDate: new Date('2026-09-15'),
    location: 'Angalakuduru Grove',
    qualityGrade: 'B',
    freshnessPercentage: 86,
    spoilageRiskPercentage: 24,
  },
  {
    produceId: 'PROD-010',
    farmerId: 'F-1003',
    cropName: 'Papaya',
    quantityKg: 600,
    harvestDate: new Date('2026-09-14'),
    location: 'Gollapudi South',
    qualityGrade: 'A',
    freshnessPercentage: 91,
    spoilageRiskPercentage: 19,
  },
];

// 4. 5 Transport Vehicles
const SEED_VEHICLES = [
  {
    vehicleId: 'TR-001',
    providerName: 'Venkata Reefer Logistics',
    vehicleType: 'Mahindra Bolero Maxi Reefer',
    capacityKg: 1200,
    currentLocation: 'Guntur Outer Ring Road',
    destination: 'Guntur Agro Freeze Hub (CS-102)',
    status: 'in_transit',
    bookingId: 'BK-9021',
  },
  {
    vehicleId: 'TR-002',
    providerName: 'Sri Krishna Reefer Services',
    vehicleType: 'Tata 407 Reefer Van',
    capacityKg: 2500,
    currentLocation: 'Vijayawada Bypass',
    destination: 'Tenali Market Yard',
    status: 'available',
  },
  {
    vehicleId: 'TR-003',
    providerName: 'Amaravati Green Corridors',
    vehicleType: 'Ashok Leyland Dost Reefer',
    capacityKg: 1500,
    currentLocation: 'Amaravati Hub',
    destination: 'Rayapudi',
    status: 'available',
  },
  {
    vehicleId: 'TR-004',
    providerName: 'Deccan Multi-Temp Express',
    vehicleType: 'Eicher Pro 2049 Refrigerated Truck',
    capacityKg: 3200,
    currentLocation: 'Eluru Highway Cross',
    status: 'available',
  },
  {
    vehicleId: 'TR-005',
    providerName: 'Andhra Kisan Reefer Fleet',
    vehicleType: 'Mahindra Supro Reefer Van',
    capacityKg: 1000,
    currentLocation: 'Tenali Auto Nagar',
    destination: 'Guntur Hub',
    status: 'maintenance',
  },
];

// 5. 5 Bookings
const SEED_BOOKINGS = [
  {
    bookingId: 'BK-9021',
    farmerId: 'F-1001',
    produceId: 'PROD-001',
    storageId: 'CS-102',
    vehicleId: 'TR-001',
    quantityKg: 500,
    pickupLocation: 'Pedakakani Farm 4',
    destination: 'Guntur Agro Freeze Hub (CS-102)',
    status: 'in_transit',
  },
  {
    bookingId: 'BK-9018',
    farmerId: 'F-1002',
    produceId: 'PROD-002',
    storageId: 'CS-104',
    vehicleId: 'TR-004',
    quantityKg: 1200,
    pickupLocation: 'Angalakuduru Orchard',
    destination: 'Tenali Rural Cooperative (CS-104)',
    status: 'confirmed',
  },
  {
    bookingId: 'BK-9015',
    farmerId: 'F-1003',
    produceId: 'PROD-003',
    storageId: 'CS-101',
    vehicleId: 'TR-002',
    quantityKg: 850,
    pickupLocation: 'Gollapudi Plot 2',
    destination: 'Vijayawada Central (CS-101)',
    status: 'completed',
  },
  {
    bookingId: 'BK-9012',
    farmerId: 'F-1004',
    produceId: 'PROD-005',
    storageId: 'CS-103',
    vehicleId: 'TR-003',
    quantityKg: 650,
    pickupLocation: 'Vatluru Agri Block',
    destination: 'Amaravati Micro Cold Vault (CS-103)',
    status: 'confirmed',
  },
  {
    bookingId: 'BK-9009',
    farmerId: 'F-1005',
    produceId: 'PROD-007',
    storageId: 'CS-101',
    vehicleId: 'TR-002',
    quantityKg: 1500,
    pickupLocation: 'Mandadam Farm Area',
    destination: 'Vijayawada Central (CS-101)',
    status: 'completed',
  },
];

// 6. Timestamped IoT Readings
const now = Date.now();
const SEED_IOT_READINGS = [
  {
    sensorId: 'SEN-102',
    storageId: 'CS-102',
    temperature: 8.4,
    humidity: 78,
    recordedAt: new Date(now - 1000 * 60 * 30), // 30m ago
    alertStatus: 'normal',
  },
  {
    sensorId: 'SEN-102',
    storageId: 'CS-102',
    temperature: 8.6,
    humidity: 79,
    recordedAt: new Date(now - 1000 * 60 * 20), // 20m ago
    alertStatus: 'normal',
  },
  {
    sensorId: 'SEN-102',
    storageId: 'CS-102',
    temperature: 9.1,
    humidity: 80,
    recordedAt: new Date(now - 1000 * 60 * 10), // 10m ago
    alertStatus: 'warning',
  },
  {
    sensorId: 'SEN-102',
    storageId: 'CS-102',
    temperature: 8.4,
    humidity: 78,
    recordedAt: new Date(now), // current
    alertStatus: 'normal',
  },
  {
    sensorId: 'SEN-101',
    storageId: 'CS-101',
    temperature: 8.2,
    humidity: 78,
    recordedAt: new Date(now - 1000 * 60 * 15),
    alertStatus: 'normal',
  },
  {
    sensorId: 'SEN-101',
    storageId: 'CS-101',
    temperature: 8.3,
    humidity: 77,
    recordedAt: new Date(now),
    alertStatus: 'normal',
  },
  {
    sensorId: 'SEN-103',
    storageId: 'CS-103',
    temperature: 7.5,
    humidity: 80,
    recordedAt: new Date(now - 1000 * 60 * 25),
    alertStatus: 'normal',
  },
  {
    sensorId: 'SEN-104',
    storageId: 'CS-104',
    temperature: 9.0,
    humidity: 75,
    recordedAt: new Date(now - 1000 * 60 * 5),
    alertStatus: 'normal',
  },
];

// 7. Market Prices (clearly marked as SIMULATED demonstration data)
const SEED_MARKET_PRICES = [
  {
    cropName: 'Tomato',
    marketName: 'Guntur Mirchi & Vegetable Yard',
    district: 'Guntur',
    pricePerKg: 35,
    recordedAt: new Date(),
    dataSource: 'SIMULATED_DEMO_DATA',
  },
  {
    cropName: 'Tomato',
    marketName: 'Vijayawada Kedareswarapet Market',
    district: 'Krishna',
    pricePerKg: 38,
    recordedAt: new Date(),
    dataSource: 'SIMULATED_DEMO_DATA',
  },
  {
    cropName: 'Mango (Banganapalli)',
    marketName: 'Nuzvid Fruit Market Yard',
    district: 'Eluru',
    pricePerKg: 85,
    recordedAt: new Date(),
    dataSource: 'SIMULATED_DEMO_DATA',
  },
  {
    cropName: 'Banana',
    marketName: 'Tenali Agricultural Market',
    district: 'Guntur',
    pricePerKg: 40,
    recordedAt: new Date(),
    dataSource: 'SIMULATED_DEMO_DATA',
  },
  {
    cropName: 'Chilli (Green)',
    marketName: 'Guntur APMC Yard',
    district: 'Guntur',
    pricePerKg: 65,
    recordedAt: new Date(),
    dataSource: 'SIMULATED_DEMO_DATA',
  },
  {
    cropName: 'Onion',
    marketName: 'Vijayawada Rythu Bazar',
    district: 'Krishna',
    pricePerKg: 32,
    recordedAt: new Date(),
    dataSource: 'SIMULATED_DEMO_DATA',
  },
  {
    cropName: 'Potato',
    marketName: 'Amaravati Subzi Mandi',
    district: 'Amaravati',
    pricePerKg: 28,
    recordedAt: new Date(),
    dataSource: 'SIMULATED_DEMO_DATA',
  },
];

// 8. AI Predictions (clearly flagged as isSimulated: true)
const SEED_AI_PREDICTIONS = [
  {
    predictionId: 'PRED-001',
    produceId: 'PROD-001',
    modelType: 'Computer-Vision-Quality-Grading-v1 (Simulated)',
    qualityGrade: 'A',
    freshnessPercentage: 92,
    spoilageRiskPercentage: 18,
    confidenceScore: 0.94,
    recommendation: 'Store in Cold Storage CS-102 at 8-12°C. Expected safe shelf life: 28 days.',
    isSimulated: true,
  },
  {
    predictionId: 'PRED-002',
    produceId: 'PROD-002',
    modelType: 'Ethylene-Ripeness-Predictor-v2 (Simulated)',
    qualityGrade: 'A',
    freshnessPercentage: 90,
    spoilageRiskPercentage: 22,
    confidenceScore: 0.91,
    recommendation: 'Store in Tenali Cold Chain CS-104 at 10-13°C. Safe duration: 25 days.',
    isSimulated: true,
  },
  {
    predictionId: 'PRED-003',
    produceId: 'PROD-003',
    modelType: 'Perishability-Heuristic-Classifier-v1 (Simulated)',
    qualityGrade: 'A',
    freshnessPercentage: 94,
    spoilageRiskPercentage: 14,
    confidenceScore: 0.96,
    recommendation: 'Store in Vijayawada Central CS-101 at 13-14°C. Safe duration: 21 days.',
    isSimulated: true,
  },
  {
    predictionId: 'PRED-004',
    produceId: 'PROD-004',
    modelType: 'Moisture-Loss-Regression-v1 (Simulated)',
    qualityGrade: 'B',
    freshnessPercentage: 88,
    spoilageRiskPercentage: 26,
    confidenceScore: 0.88,
    recommendation: 'Immediate cold storage recommended. High moisture sensitivity.',
    isSimulated: true,
  },
];

async function runSeed() {
  const isClearRequested = process.argv.includes('--clear');

  try {
    console.log('🔄 Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGODB_URI as string);
    console.log(`✅ Connected to database: ${mongoose.connection.name}`);

    // Safety guard: prevent clearing if DB name looks like a production environment
    const dbName = mongoose.connection.name || '';
    if (isClearRequested) {
      if (dbName.toLowerCase().includes('prod') && !dbName.toLowerCase().includes('demo')) {
        console.error('⛔ REFUSING to clear database with "prod" in name. Aborting for safety.');
        process.exit(1);
      }
      console.log('🧹 Explicit --clear flag provided. Clearing existing demo collections...');
      await Promise.all([
        Farmer.deleteMany({}),
        Produce.deleteMany({}),
        ColdStorage.deleteMany({}),
        TransportVehicle.deleteMany({}),
        Booking.deleteMany({}),
        IoTReading.deleteMany({}),
        MarketPrice.deleteMany({}),
        AiPrediction.deleteMany({}),
      ]);
      console.log('✨ Existing collections cleared.');
    }

    console.log('🌱 Seeding collections (idempotent upsert)...');

    // 1. Farmers
    for (const farmer of SEED_FARMERS) {
      await Farmer.findOneAndUpdate({ farmerId: farmer.farmerId }, farmer, { upsert: true, new: true });
    }
    console.log(`✓ Farmers: ${SEED_FARMERS.length} records processed`);

    // 2. Cold Storages
    for (const storage of SEED_COLD_STORAGES) {
      await ColdStorage.findOneAndUpdate({ storageId: storage.storageId }, storage, { upsert: true, new: true });
    }
    console.log(`✓ Cold Storages: ${SEED_COLD_STORAGES.length} records processed`);

    // 3. Produce
    for (const p of SEED_PRODUCE) {
      await Produce.findOneAndUpdate({ produceId: p.produceId }, p, { upsert: true, new: true });
    }
    console.log(`✓ Produce: ${SEED_PRODUCE.length} records processed`);

    // 4. Vehicles
    for (const v of SEED_VEHICLES) {
      await TransportVehicle.findOneAndUpdate({ vehicleId: v.vehicleId }, v, { upsert: true, new: true });
    }
    console.log(`✓ Transport Vehicles: ${SEED_VEHICLES.length} records processed`);

    // 5. Bookings
    for (const b of SEED_BOOKINGS) {
      await Booking.findOneAndUpdate({ bookingId: b.bookingId }, b, { upsert: true, new: true });
    }
    console.log(`✓ Bookings: ${SEED_BOOKINGS.length} records processed`);

    // 6. IoT Readings
    for (const r of SEED_IOT_READINGS) {
      const exists = await IoTReading.findOne({
        sensorId: r.sensorId,
        storageId: r.storageId,
        recordedAt: r.recordedAt,
      });
      if (!exists) {
        await IoTReading.create(r);
      }
    }
    console.log(`✓ IoT Readings: ${SEED_IOT_READINGS.length} readings processed`);

    // 7. Market Prices
    for (const mp of SEED_MARKET_PRICES) {
      await MarketPrice.findOneAndUpdate(
        { cropName: mp.cropName, marketName: mp.marketName },
        mp,
        { upsert: true, new: true }
      );
    }
    console.log(`✓ Market Prices: ${SEED_MARKET_PRICES.length} records processed (Simulated)`);

    // 8. AI Predictions
    for (const pred of SEED_AI_PREDICTIONS) {
      await AiPrediction.findOneAndUpdate({ predictionId: pred.predictionId }, pred, {
        upsert: true,
        new: true,
      });
    }
    console.log(`✓ AI Predictions: ${SEED_AI_PREDICTIONS.length} records processed (Simulated)`);

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

runSeed();
