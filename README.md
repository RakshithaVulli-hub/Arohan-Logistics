# Micro Cold Chain Supply Logistics
### AI-Powered & IoT-Enabled Platform for Small & Marginal Farmers

A full-stack cold chain logistics platform designed to prevent post-harvest perishables loss across regional agricultural corridors in Andhra Pradesh (Guntur, Vijayawada, Tenali, Amaravati, Eluru).

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│               React + Vite Frontend (Port 3000)         │
│  - Farmer Portal       - Cold Storage Dashboard         │
│  - Produce Ingestion   - Fleet & Transport Tracking     │
│  - AI Quality Grading  - Admin Command Center           │
│  - Spoilage Prediction - Database Explorer (Live MongoDB)│
└────────────────────────────┬────────────────────────────┘
                             │ REST API (JSON)
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Express.js Backend (Port 5001)             │
│  - /api/farmers        - /api/produce                   │
│  - /api/storages       - /api/vehicles                  │
│  - /api/bookings       - /api/iot                       │
│  - /api/market-prices  - /api/ai-predictions            │
│  - /api/health         - /api/stats                     │
└────────────────────────────┬────────────────────────────┘
                             │ Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 MongoDB Atlas Database                  │
│  8 Collections: farmers, produce, coldStorages,         │
│  transportVehicles, bookings, iotReadings,             │
│  marketPrices, aiPredictions                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB Atlas** account (free tier cluster) or local MongoDB instance

---

### 2. Configure MongoDB Connection

1. Navigate to the `server/` directory and create your `.env` file:
   ```bash
   cd server
   cp .env.example .env
   ```
2. Open `server/.env` and paste your MongoDB Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/cold_chain_db?retryWrites=true&w=majority
   PORT=5001
   CLIENT_ORIGIN=http://localhost:3000
   ```

---

### 3. Install Dependencies

From the project root:
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

---

### 4. Seed the Database with Sample Data

Populate the database with realistic demonstration records from Andhra Pradesh (5 farmers, 10 produce batches, 4 cold storage facilities, 5 transport vehicles, 5 bookings, IoT readings, simulated market prices, and AI predictions):

```bash
# From root directory:
npm run seed

# Or from server directory:
cd server
npm run seed
```

> **To safely clear and re-seed from scratch:**
> ```bash
> npm run seed:clear
> ```
> *(Includes an automatic safety guard preventing execution on databases containing "prod" in their name).*

---

### 5. Start the Application

You run the backend and frontend in two separate terminal windows:

#### Terminal 1 — Start the Express Backend:
```bash
npm run dev:server
# Or: cd server && npm run dev
```
*Backend runs on `http://localhost:5001` with auto-reload via `tsx watch`.*

#### Terminal 2 — Start the React Frontend:
```bash
npm run dev
```
*Frontend opens at `http://localhost:3000`.*

---

## 📡 REST API Reference

| Resource | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Checks API & MongoDB connection status |
| **Stats** | `GET` | `/api/stats` | Real-time record counts across all 8 collections |
| **Farmers** | `GET` | `/api/farmers` | List all farmers |
| | `GET` | `/api/farmers/:id` | Get farmer by `farmerId` |
| | `POST` | `/api/farmers` | Create new farmer |
| | `PUT` | `/api/farmers/:id` | Update farmer details |
| **Produce** | `GET` | `/api/produce` | List produce (filter: `?farmerId=`, `?cropName=`) |
| | `GET` | `/api/produce/:id` | Get produce by `produceId` |
| | `POST` | `/api/produce` | Register new harvest batch |
| **Cold Storage** | `GET` | `/api/storages` | List hubs with auto-calculated available capacity |
| | `GET` | `/api/storages/:id` | Facility details and microclimate ranges |
| **Transport** | `GET` | `/api/vehicles` | List fleet vehicles & GPS locations |
| | `GET` | `/api/vehicles/:id` | Specific reefer vehicle details |
| **Bookings** | `GET` | `/api/bookings` | List storage bookings |
| | `POST` | `/api/bookings` | Create booking (auto-deducts chamber headroom) |
| | `PATCH` | `/api/bookings/:id/status`| Update status (`pending`, `confirmed`, `in_transit`, `completed`) |
| **IoT Telemetry**| `GET` | `/api/iot/readings` | Stream timestamped sensor logs |
| | `GET` | `/api/iot/readings/:storageId` | Facility-specific chamber telemetry |
| | `POST` | `/api/iot/readings` | Log sensor reading to database |
| **Market Prices**| `GET` | `/api/market-prices` | APMC mandi price indicators *(simulated demonstration)* |
| **AI Predictions**| `GET` | `/api/ai-predictions` | Computer vision grading & spoilage risk models |
| | `POST` | `/api/ai-predictions` | Record prediction result (`isSimulated: true`) |

---

## 🗄️ MongoDB Collections & Schemas

1. **`farmers`** — `farmerId`, `name`, `phone`, `village`, `district`, `landArea`, `crops`, `createdAt`
2. **`produce`** — `produceId`, `farmerId`, `cropName`, `quantityKg`, `harvestDate`, `location`, `qualityGrade`, `freshnessPercentage`, `spoilageRiskPercentage`, `createdAt`
3. **`coldStorages`** — `storageId`, `name`, `location`, `district`, `capacityKg`, `occupiedCapacityKg`, `availableCapacityKg`, `supportedCrops`, `minimumTemperature`, `maximumTemperature`, `humidityRange`, `storageCostPerKg`, `status`
4. **`transportVehicles`** — `vehicleId`, `providerName`, `vehicleType`, `capacityKg`, `currentLocation`, `destination`, `status`, `bookingId`
5. **`bookings`** — `bookingId`, `farmerId`, `produceId`, `storageId`, `vehicleId`, `quantityKg`, `pickupLocation`, `destination`, `status`, `createdAt`, `updatedAt`
6. **`iotReadings`** — `sensorId`, `storageId`, `temperature`, `humidity`, `recordedAt`, `alertStatus`
7. **`marketPrices`** — `cropName`, `marketName`, `district`, `pricePerKg`, `recordedAt`, `dataSource` *(marked as simulated)*
8. **`aiPredictions`** — `predictionId`, `produceId`, `modelType`, `qualityGrade`, `freshnessPercentage`, `spoilageRiskPercentage`, `confidenceScore`, `recommendation`, `isSimulated: true`, `createdAt`

---

## 🎓 Faculty / Evaluator Demonstration Guide

1. **Open the Website:** Go to `http://localhost:3000`.
2. **Access Admin Command Center:** Click **Admin Dashboard** in the sidebar.
3. **Open Database Explorer:** Click the green **"Database Explorer"** tab at the top of the command center.
4. **Demonstrate Live MongoDB Connection:**
   - Notice the connection pill: `MongoDB: Connected (<db_name>)`.
   - Review total document counts across all 8 collections.
   - Switch between collection cards (`Farmers`, `Produce`, `Cold Storages`, etc.).
   - Use the live search bar to filter records instantly.
   - Click **"Refresh Data"** to show live querying against MongoDB Atlas.
5. **Demonstrate Data Persistence:**
   - Register a new produce batch in the Farmer Portal.
   - Switch back to Admin Dashboard → Database Explorer → **Produce**.
   - Notice the newly created document persisted in MongoDB with real timestamps.

---

## ⚠️ Notes on Simulation

- **IoT Telemetry & Temperature Spikes:** Transducers are simulated for lab demonstration; readings are recorded to MongoDB timestamped collections.
- **AI Models & Quality Grading:** Predictive scoring uses algorithmic heuristics labeled with `isSimulated: true`.
- **Market Prices:** Figures reflect realistic regional market rates in Andhra Pradesh marked with `dataSource: "SIMULATED_DEMO_DATA"`.
