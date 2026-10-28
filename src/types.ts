/**
 * MICRO COLD CHAIN SUPPLY LOGISTICS
 * Domain Models, Conceptual OOP Classes, and State Type Definitions
 */

export type UserRole = 'farmer' | 'operator' | 'transport' | 'admin';

export interface ColdChainUser {
  userId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  password?: string;
  role: UserRole;
}

export interface Farmer extends ColdChainUser {
  farmerId: string;
  farmLocation: string;
  produceList: string[]; // produce IDs
}

export interface TransportProvider extends ColdChainUser {
  providerId: string;
  vehicleId: string;
  vehicleType: string;
  vehicleCapacity: number; // in kg
  isRefrigerated: boolean;
  currentLocation: string;
  availability: boolean;
  transportationCost: number; // base cost or per-km cost in ₹
  rating?: number;
}

export type ProduceStatus = 
  | 'Harvested' 
  | 'Pending Storage' 
  | 'In Transit' 
  | 'Safely Stored' 
  | 'At Risk' 
  | 'Relocated' 
  | 'Sold';

export interface Produce {
  produceId: string;
  farmerId: string;
  farmerName: string;
  cropType: string;
  quantity: number; // in kg
  unit: string;
  harvestDate: string;
  sourceLocation: string;
  storageDuration: number; // in days
  expectedDuration: number; // days
  preferredTempMin: number;
  preferredTempMax: number;
  preferredHumidityMin: number;
  preferredHumidityMax: number;
  currentStatus: ProduceStatus;
  currentStorageId?: string;
  currentStorageName?: string;
  spoilageRiskScore?: number; // 0 - 100
  spoilageRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ColdStorage {
  storageId: string;
  name: string;
  location: string;
  totalCapacity: number; // in kg
  availableCapacity: number; // in kg
  occupiedCapacity: number; // in kg
  capacityKg?: number;
  occupiedCapacityKg?: number;
  availableCapacityKg?: number;
  storageCost: number; // ₹ per kg per day
  temperature: number; // in °C
  humidity: number; // in %
  availability: boolean;
  operatorName: string;
  operatorContact: string;
  type: 'Central Cold Storage' | 'Micro Cold Hub' | 'Farmer Cooperative Storage';
  sensorId: string;
  powerBackup: boolean;
  coolingTech: string;
  supportedCrops?: string[];
  district?: string;
  minimumTemperature?: number;
  maximumTemperature?: number;
  humidityRange?: string;
  status?: 'available' | 'full' | 'maintenance';
}

export interface IoTReadingItem {
  _id: string;
  sensorId: string;
  storageId: string;
  temperature: number;
  humidity: number;
  recordedAt: string;
  alertStatus: 'normal' | 'warning' | 'critical';
}

export interface MarketPriceItem {
  _id: string;
  cropName: string;
  marketName: string;
  district: string;
  pricePerKg: number;
  recordedAt: string;
  dataSource: string;
}

export interface AiPredictionItem {
  _id: string;
  predictionId: string;
  produceId: string;
  modelType: string;
  qualityGrade: 'A' | 'B' | 'C' | 'D';
  freshnessPercentage: number;
  spoilageRiskPercentage: number;
  confidenceScore: number;
  recommendation: string;
  isSimulated: boolean;
  createdAt: string;
}

export type SensorStatus = 'online' | 'normal' | 'warning' | 'critical' | 'offline';

export interface IoTSensor {
  sensorId: string;
  temperature: number; // in °C
  humidity: number; // in %
  timestamp: string;
  sensorStatus: SensorStatus;
  storageId: string;
  storageName: string;
  batteryLevel: number;
  firmwareVersion: string;
}

export interface SensorTelemetryPoint {
  time: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  sensorId: string;
  status: SensorStatus;
}

export interface Booking {
  bookingId: string;
  farmerId: string;
  farmerName: string;
  produceId: string;
  cropType: string;
  quantity: number;
  storageId: string;
  storageName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  storageCost: number;
  transportCost: number;
  totalCost: number;
  status: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  isSharedTransport: boolean;
  transportId?: string;
  vehicleId?: string;
  pickupLocation?: string;
  destination?: string;
  rawStatus?: 'pending' | 'confirmed' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
}

export interface TransportVehicle {
  vehicleId: string;
  providerName: string;
  vehicleType: string;
  capacityKg: number;
  currentLocation: string;
  destination?: string;
  status: 'available' | 'in_transit' | 'maintenance';
  bookingId?: string;
}

export type TransportProgressStatus = 
  | 'Requested'
  | 'Accepted'
  | 'Pickup Scheduled'
  | 'Produce Collected'
  | 'In Transit'
  | 'Delivered';

export interface TransportRequest {
  requestId: string;
  vehicleId: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  farmerId: string;
  farmerName: string;
  produceId: string;
  cropType: string;
  quantity: number;
  pickupLocation: string;
  destination: string;
  storageName: string;
  isRefrigerated: boolean;
  cost: number;
  status: TransportProgressStatus;
  distanceKm: number;
  estimatedArrival: string;
  isShared: boolean;
  sharedSavings?: number;
  departureTime?: string;
}

export interface AggregatedShipment {
  groupId: string;
  cropType: string;
  destinationHub: string;
  storageId: string;
  vehicleCapacity: number;
  totalCollected: number;
  maxCapacity: number;
  participants: {
    farmerId: string;
    farmerName: string;
    quantity: number;
    location: string;
    joined: boolean;
  }[];
  individualCostPerFarmer: number;
  sharedCostPerFarmer: number;
  savingsPerFarmer: number;
  vehicleId: string;
  status: 'Open for Aggregation' | 'Optimal Capacity Reached' | 'Transport Booked';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'storage' | 'transport' | 'iot_alert' | 'spoilage_alert' | 'aggregation' | 'system';
  severity: 'info' | 'success' | 'warning' | 'danger';
  timestamp: string;
  read: boolean;
  actionText?: string;
  actionView?: string;
}

export interface SpoilagePredictionResult {
  cropType: string;
  quantity: number;
  storageDuration: number;
  temperature: number;
  humidity: number;
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  recommendation: string;
  factors: {
    temperatureImpact: 'Low impact' | 'Medium impact' | 'High impact' | 'Critical impact';
    humidityImpact: 'Low impact' | 'Medium impact' | 'High impact';
    storageDurationImpact: 'Low impact' | 'Medium impact' | 'High impact';
    cropSensitivity: 'Low' | 'Medium' | 'High';
  };
}

export interface StorageRecommendation {
  storage: ColdStorage;
  distanceKm: number;
  storageCostTotal: number;
  transportCost: number;
  totalEstimatedCost: number;
  suitabilityScore: number; // 0 - 100
  suitabilityGrade: 'High' | 'Medium' | 'Fair';
  environmentalMatch: boolean;
  aiExplanation: string;
}
