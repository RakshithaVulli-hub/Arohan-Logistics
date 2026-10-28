import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is missing');
  process.exit(1);
}

function parseExtendedJson(obj: any): any {
  if (Array.isArray(obj)) return obj.map(parseExtendedJson);
  if (obj !== null && typeof obj === 'object') {
    if ('$oid' in obj) return new mongoose.Types.ObjectId(obj['$oid']);
    if ('$date' in obj) return new Date(obj['$date']);
    const res: Record<string, any> = {};
    for (const k of Object.keys(obj)) {
      res[k] = parseExtendedJson(obj[k]);
    }
    return res;
  }
  return obj;
}

export async function migrateLocalBackup() {
  await mongoose.connect(MONGODB_URI as string);
  console.log('✅ Connected to MongoDB Atlas DB:', mongoose.connection.name);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established.');
  }

  const migrationDir = path.resolve(__dirname, '../arohan migration');
  if (!fs.existsSync(migrationDir)) {
    console.log('No arohan migration directory found.');
    return;
  }

  // 1. Farmers
  const fPath = path.join(migrationDir, 'cold_chain_db.farmers.json');
  if (fs.existsSync(fPath)) {
    const farmers = parseExtendedJson(JSON.parse(fs.readFileSync(fPath, 'utf-8')));
    for (const doc of farmers) {
      const { _id, __v, ...data } = doc;
      await db.collection('farmers').updateOne(
        { farmerId: doc.farmerId },
        { $setOnInsert: { _id, ...data } },
        { upsert: true }
      );
    }
    console.log(`✓ Farmers: processed ${farmers.length} records`);
  }

  // 2. Cold Storages
  const sPath = path.join(migrationDir, 'cold_chain_db.coldstorages.json');
  if (fs.existsSync(sPath)) {
    const storages = parseExtendedJson(JSON.parse(fs.readFileSync(sPath, 'utf-8')));
    for (const doc of storages) {
      const { _id, __v, ...data } = doc;
      await db.collection('coldstorages').updateOne(
        { storageId: doc.storageId },
        { $setOnInsert: { _id, ...data } },
        { upsert: true }
      );
    }
    console.log(`✓ Cold Storages: processed ${storages.length} records`);
  }

  // 3. Transport Vehicles
  const vPath = path.join(migrationDir, 'cold_chain_db.transportvehicles.json');
  if (fs.existsSync(vPath)) {
    const vehicles = parseExtendedJson(JSON.parse(fs.readFileSync(vPath, 'utf-8')));
    for (const doc of vehicles) {
      const { _id, __v, ...data } = doc;
      await db.collection('transportvehicles').updateOne(
        { vehicleId: doc.vehicleId },
        { $setOnInsert: { _id, ...data } },
        { upsert: true }
      );
    }
    console.log(`✓ Transport Vehicles: processed ${vehicles.length} records`);
  }

  // 4. Produces
  const pPath = path.join(migrationDir, 'cold_chain_db.produces.json');
  if (fs.existsSync(pPath)) {
    const produces = parseExtendedJson(JSON.parse(fs.readFileSync(pPath, 'utf-8')));
    for (const doc of produces) {
      const { _id, __v, ...data } = doc;
      await db.collection('produces').updateOne(
        { produceId: doc.produceId },
        { $setOnInsert: { _id, ...data } },
        { upsert: true }
      );
    }
    console.log(`✓ Produces: processed ${produces.length} records`);
  }

  // 5. Bookings
  const bPath = path.join(migrationDir, 'cold_chain_db.bookings.json');
  if (fs.existsSync(bPath)) {
    const bookings = parseExtendedJson(JSON.parse(fs.readFileSync(bPath, 'utf-8')));
    for (const doc of bookings) {
      const { _id, __v, ...data } = doc;
      await db.collection('bookings').updateOne(
        { bookingId: doc.bookingId },
        { $setOnInsert: { _id, ...data } },
        { upsert: true }
      );
    }
    console.log(`✓ Bookings: processed ${bookings.length} records`);
  }

  // 6. IoT Readings
  const rPath = path.join(migrationDir, 'cold_chain_db.iotreadings.json');
  if (fs.existsSync(rPath)) {
    const readings = parseExtendedJson(JSON.parse(fs.readFileSync(rPath, 'utf-8')));
    for (const doc of readings) {
      const { _id, __v, ...data } = doc;
      await db.collection('iotreadings').updateOne(
        { sensorId: doc.sensorId, storageId: doc.storageId, recordedAt: doc.recordedAt },
        { $setOnInsert: { _id, ...data } },
        { upsert: true }
      );
    }
    console.log(`✓ IoT Readings: processed ${readings.length} records`);
  }

  // 7. Market Prices
  const mPath = path.join(migrationDir, 'cold_chain_db.marketprices.json');
  if (fs.existsSync(mPath)) {
    const prices = parseExtendedJson(JSON.parse(fs.readFileSync(mPath, 'utf-8')));
    for (const doc of prices) {
      const { _id, __v, ...data } = doc;
      await db.collection('marketprices').updateOne(
        { cropName: doc.cropName, marketName: doc.marketName },
        { $setOnInsert: { _id, ...data } },
        { upsert: true }
      );
    }
    console.log(`✓ Market Prices: processed ${prices.length} records`);
  }

  // 8. AI Predictions
  const aPath = path.join(migrationDir, 'cold_chain_db.aipredictions.json');
  if (fs.existsSync(aPath)) {
    const predictions = parseExtendedJson(JSON.parse(fs.readFileSync(aPath, 'utf-8')));
    for (const doc of predictions) {
      const { _id, __v, ...data } = doc;
      await db.collection('aipredictions').updateOne(
        { predictionId: doc.predictionId },
        { $setOnInsert: { _id, ...data } },
        { upsert: true }
      );
    }
    console.log(`✓ AI Predictions: processed ${predictions.length} records`);
  }

  console.log('\n--- VERIFICATION OF ATLAS TOTAL COUNTS ---');
  const cols = [
    'farmers',
    'produces',
    'coldstorages',
    'transportvehicles',
    'bookings',
    'iotreadings',
    'marketprices',
    'aipredictions',
  ];
  for (const c of cols) {
    const count = await db.collection(c).countDocuments();
    console.log(`- ${c}: ${count} records`);
  }

  await mongoose.disconnect();
}

if (require.main === module || process.argv[1]?.endsWith('migrateAtlas.ts')) {
  migrateLocalBackup().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
