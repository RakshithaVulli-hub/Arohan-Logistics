/**
 * Sample domain mock data and initial states for Indian Cold-Chain Logistics Hub
 */
import { 
  Farmer, 
  TransportProvider, 
  ColdStorage, 
  IoTSensor, 
  Produce, 
  Booking, 
  TransportRequest, 
  AggregatedShipment, 
  NotificationItem,
  SensorTelemetryPoint 
} from '../types';

export const CROP_PROFILES: Record<string, {
  name: string;
  optimalTempMin: number;
  optimalTempMax: number;
  optimalHumidityMin: number;
  optimalHumidityMax: number;
  perishability: 'High' | 'Medium' | 'Low';
  typicalShelfLifeDays: number;
  coldShelfLifeDays: number;
  avgMarketRatePerKg: number;
}> = {
  'Tomato': {
    name: 'Tomato',
    optimalTempMin: 8,
    optimalTempMax: 12,
    optimalHumidityMin: 80,
    optimalHumidityMax: 90,
    perishability: 'High',
    typicalShelfLifeDays: 5,
    coldShelfLifeDays: 28,
    avgMarketRatePerKg: 35
  },
  'Mango': {
    name: 'Mango',
    optimalTempMin: 10,
    optimalTempMax: 13,
    optimalHumidityMin: 85,
    optimalHumidityMax: 90,
    perishability: 'High',
    typicalShelfLifeDays: 7,
    coldShelfLifeDays: 25,
    avgMarketRatePerKg: 85
  },
  'Banana': {
    name: 'Banana',
    optimalTempMin: 13,
    optimalTempMax: 14,
    optimalHumidityMin: 90,
    optimalHumidityMax: 95,
    perishability: 'High',
    typicalShelfLifeDays: 6,
    coldShelfLifeDays: 21,
    avgMarketRatePerKg: 40
  },
  'Potato': {
    name: 'Potato',
    optimalTempMin: 4,
    optimalTempMax: 8,
    optimalHumidityMin: 90,
    optimalHumidityMax: 95,
    perishability: 'Low',
    typicalShelfLifeDays: 25,
    coldShelfLifeDays: 180,
    avgMarketRatePerKg: 28
  },
  'Onion': {
    name: 'Onion',
    optimalTempMin: 0,
    optimalTempMax: 2,
    optimalHumidityMin: 65,
    optimalHumidityMax: 70,
    perishability: 'Low',
    typicalShelfLifeDays: 30,
    coldShelfLifeDays: 150,
    avgMarketRatePerKg: 32
  },
  'Apple': {
    name: 'Apple',
    optimalTempMin: 0,
    optimalTempMax: 3,
    optimalHumidityMin: 90,
    optimalHumidityMax: 95,
    perishability: 'Medium',
    typicalShelfLifeDays: 14,
    coldShelfLifeDays: 120,
    avgMarketRatePerKg: 140
  },
  'Grapes': {
    name: 'Grapes',
    optimalTempMin: 0,
    optimalTempMax: 1,
    optimalHumidityMin: 90,
    optimalHumidityMax: 95,
    perishability: 'High',
    typicalShelfLifeDays: 4,
    coldShelfLifeDays: 45,
    avgMarketRatePerKg: 90
  },
  'Leafy Vegetables': {
    name: 'Leafy Vegetables',
    optimalTempMin: 1,
    optimalTempMax: 4,
    optimalHumidityMin: 95,
    optimalHumidityMax: 98,
    perishability: 'High',
    typicalShelfLifeDays: 2,
    coldShelfLifeDays: 12,
    avgMarketRatePerKg: 50
  },
  'Chilli (Green)': {
    name: 'Chilli (Green)',
    optimalTempMin: 7,
    optimalTempMax: 10,
    optimalHumidityMin: 85,
    optimalHumidityMax: 90,
    perishability: 'Medium',
    typicalShelfLifeDays: 8,
    coldShelfLifeDays: 30,
    avgMarketRatePerKg: 65
  }
};

export const INITIAL_FARMERS: Farmer[] = [
  {
    userId: 'F-1001',
    farmerId: 'F-1001',
    name: 'Ravi Kumar',
    email: 'ravi.kumar@agrokrishi.in',
    phone: '+91 98480 12345',
    location: 'Guntur Rural',
    farmLocation: 'Guntur Rural (8 km from Hub)',
    role: 'farmer',
    produceList: ['PROD-001', 'PROD-004']
  },
  {
    userId: 'F-1002',
    farmerId: 'F-1002',
    name: 'Lakshmi Devi',
    email: 'lakshmi.d@farmercoop.org',
    phone: '+91 94401 67890',
    location: 'Tenali Mandalam',
    farmLocation: 'Tenali East',
    role: 'farmer',
    produceList: ['PROD-002']
  },
  {
    userId: 'F-1003',
    farmerId: 'F-1003',
    name: 'Suresh Varma',
    email: 'suresh.varma@apfarmers.in',
    phone: '+91 99890 54321',
    location: 'Vijayawada Outskirts',
    farmLocation: 'Vijayawada West Green Belt',
    role: 'farmer',
    produceList: ['PROD-003']
  },
  {
    userId: 'F-1004',
    farmerId: 'F-1004',
    name: 'Anitha Reddy',
    email: 'anitha.reddy@kisanmail.in',
    phone: '+91 98499 87654',
    location: 'Eluru Valley',
    farmLocation: 'Eluru Agri Cluster',
    role: 'farmer',
    produceList: []
  },
  {
    userId: 'F-1005',
    farmerId: 'F-1005',
    name: 'Ramesh Naidu',
    email: 'ramesh.naidu@krishiconnect.in',
    phone: '+91 97000 45678',
    location: 'Amaravati South',
    farmLocation: 'Amaravati Riverbank Farms',
    role: 'farmer',
    produceList: []
  }
];

export const INITIAL_TRANSPORTERS: TransportProvider[] = [
  {
    userId: 'T-2001',
    providerId: 'T-2001',
    name: 'Venkata Transport & Cold Logistics',
    email: 'dispatch@venkatacold.com',
    phone: '+91 98488 22114',
    location: 'Guntur Auto Nagar',
    role: 'transport',
    vehicleId: 'TR-001',
    vehicleType: 'Mahindra Bolero Maxi Reefer',
    vehicleCapacity: 1200,
    isRefrigerated: true,
    currentLocation: '5 km away (Guntur Outer)',
    availability: true,
    transportationCost: 1400,
    rating: 4.8
  },
  {
    userId: 'T-2002',
    providerId: 'T-2002',
    name: 'Sri Krishna Reefer Services',
    email: 'krishna.reefer@logistics.in',
    phone: '+91 98485 33221',
    location: 'Vijayawada Highway',
    role: 'transport',
    vehicleId: 'TR-002',
    vehicleType: 'Tata 407 Reefer Van',
    vehicleCapacity: 2500,
    isRefrigerated: true,
    currentLocation: '8 km away (Vijayawada Bypass)',
    availability: true,
    transportationCost: 2100,
    rating: 4.9
  },
  {
    userId: 'T-2003',
    providerId: 'T-2003',
    name: 'Amaravati Green Corridors',
    email: 'contact@amaravatifleet.in',
    phone: '+91 94411 77889',
    location: 'Amaravati Central',
    role: 'transport',
    vehicleId: 'TR-003',
    vehicleType: 'Ashok Leyland Dost Reefer',
    vehicleCapacity: 1500,
    isRefrigerated: true,
    currentLocation: '12 km away (Amaravati Hub)',
    availability: false,
    transportationCost: 1600,
    rating: 4.7
  },
  {
    userId: 'T-2004',
    providerId: 'T-2004',
    name: 'Deccan Multi-Temp Express',
    email: 'deccan.fleet@express.com',
    phone: '+91 98490 99001',
    location: 'Hyderabad - Vijayawada Corridor',
    role: 'transport',
    vehicleId: 'TR-004',
    vehicleType: 'Eicher Pro 2049 Refrigerated Truck',
    vehicleCapacity: 3200,
    isRefrigerated: true,
    currentLocation: '22 km away (Eluru Cross)',
    availability: true,
    transportationCost: 2800,
    rating: 4.9
  }
];

export const INITIAL_COLD_STORAGES: ColdStorage[] = [
  {
    storageId: 'CS-101',
    name: 'Vijayawada Central Cold Storage',
    location: 'Vijayawada Ag Tech Corridor',
    totalCapacity: 15000,
    availableCapacity: 4500,
    occupiedCapacity: 10500,
    storageCost: 2.2, // ₹/kg/day
    temperature: 8.2,
    humidity: 78,
    availability: true,
    operatorName: 'B. Jagannath Rao',
    operatorContact: '+91 98481 00201',
    type: 'Central Cold Storage',
    sensorId: 'SEN-101',
    powerBackup: true,
    coolingTech: 'Vapor Compression Ammonia-Free Glycol'
  },
  {
    storageId: 'CS-102',
    name: 'Guntur Agro Freeze Hub',
    location: 'Guntur Industrial Estate Road',
    totalCapacity: 10000,
    availableCapacity: 2800,
    occupiedCapacity: 7200,
    storageCost: 2.5, // ₹/kg/day
    temperature: 8.4,
    humidity: 78,
    availability: true,
    operatorName: 'M. Satyanarayana',
    operatorContact: '+91 94402 11342',
    type: 'Micro Cold Hub',
    sensorId: 'SEN-102',
    powerBackup: true,
    coolingTech: 'Solar Hybrid Precision Multi-Zone Chiller'
  },
  {
    storageId: 'CS-103',
    name: 'Amaravati Micro Cold Vault',
    location: 'Amaravati Kisan Logistics Zone',
    totalCapacity: 6000,
    availableCapacity: 3800,
    occupiedCapacity: 2200,
    storageCost: 2.0, // ₹/kg/day
    temperature: 7.5,
    humidity: 80,
    availability: true,
    operatorName: 'K. Subrahmanyam',
    operatorContact: '+91 99891 44556',
    type: 'Micro Cold Hub',
    sensorId: 'SEN-103',
    powerBackup: true,
    coolingTech: 'Thermal Storage Phase Change Material (PCM)'
  },
  {
    storageId: 'CS-104',
    name: 'Tenali Rural Cooperative Cold Chain',
    location: 'Tenali Market Yard Yard-4',
    totalCapacity: 8000,
    availableCapacity: 1200,
    occupiedCapacity: 6800,
    storageCost: 1.8, // ₹/kg/day
    temperature: 9.0,
    humidity: 75,
    availability: true,
    operatorName: 'G. Appa Rao',
    operatorContact: '+91 98492 55667',
    type: 'Farmer Cooperative Storage',
    sensorId: 'SEN-104',
    powerBackup: true,
    coolingTech: 'Modular Inverter Rotary Compressors'
  }
];

export const INITIAL_SENSORS: IoTSensor[] = [
  {
    sensorId: 'SEN-101',
    temperature: 8.2,
    humidity: 78,
    timestamp: new Date().toLocaleTimeString(),
    sensorStatus: 'online',
    storageId: 'CS-101',
    storageName: 'Vijayawada Central Cold Storage',
    batteryLevel: 98,
    firmwareVersion: 'v2.4.1-IoT'
  },
  {
    sensorId: 'SEN-102',
    temperature: 8.4,
    humidity: 78,
    timestamp: new Date().toLocaleTimeString(),
    sensorStatus: 'online',
    storageId: 'CS-102',
    storageName: 'Guntur Agro Freeze Hub',
    batteryLevel: 94,
    firmwareVersion: 'v2.4.1-IoT'
  },
  {
    sensorId: 'SEN-103',
    temperature: 7.5,
    humidity: 80,
    timestamp: new Date().toLocaleTimeString(),
    sensorStatus: 'online',
    storageId: 'CS-103',
    storageName: 'Amaravati Micro Cold Vault',
    batteryLevel: 91,
    firmwareVersion: 'v2.3.8-IoT'
  },
  {
    sensorId: 'SEN-104',
    temperature: 9.0,
    humidity: 75,
    timestamp: new Date().toLocaleTimeString(),
    sensorStatus: 'online',
    storageId: 'CS-104',
    storageName: 'Tenali Rural Cooperative Cold Chain',
    batteryLevel: 89,
    firmwareVersion: 'v2.4.1-IoT'
  }
];

export const INITIAL_PRODUCE: Produce[] = [
  {
    produceId: 'PROD-001',
    farmerId: 'F-1001',
    farmerName: 'Ravi Kumar',
    cropType: 'Tomato',
    quantity: 500,
    unit: 'kg',
    harvestDate: '2026-09-15',
    sourceLocation: 'Guntur Rural (Farm Plot 12)',
    storageDuration: 5,
    expectedDuration: 14,
    preferredTempMin: 8,
    preferredTempMax: 12,
    preferredHumidityMin: 80,
    preferredHumidityMax: 90,
    currentStatus: 'Safely Stored',
    currentStorageId: 'CS-102',
    currentStorageName: 'Guntur Agro Freeze Hub',
    spoilageRiskScore: 18,
    spoilageRiskLevel: 'LOW'
  },
  {
    produceId: 'PROD-002',
    farmerId: 'F-1002',
    farmerName: 'Lakshmi Devi',
    cropType: 'Mango',
    quantity: 1200,
    unit: 'kg',
    harvestDate: '2026-09-14',
    sourceLocation: 'Tenali Orchard East',
    storageDuration: 4,
    expectedDuration: 20,
    preferredTempMin: 10,
    preferredTempMax: 13,
    preferredHumidityMin: 85,
    preferredHumidityMax: 90,
    currentStatus: 'Safely Stored',
    currentStorageId: 'CS-104',
    currentStorageName: 'Tenali Rural Cooperative Cold Chain',
    spoilageRiskScore: 22,
    spoilageRiskLevel: 'LOW'
  },
  {
    produceId: 'PROD-003',
    farmerId: 'F-1003',
    farmerName: 'Suresh Varma',
    cropType: 'Banana',
    quantity: 850,
    unit: 'kg',
    harvestDate: '2026-09-13',
    sourceLocation: 'Vijayawada West Plot 4',
    storageDuration: 3,
    expectedDuration: 15,
    preferredTempMin: 13,
    preferredTempMax: 14,
    preferredHumidityMin: 90,
    preferredHumidityMax: 95,
    currentStatus: 'Safely Stored',
    currentStorageId: 'CS-101',
    currentStorageName: 'Vijayawada Central Cold Storage',
    spoilageRiskScore: 14,
    spoilageRiskLevel: 'LOW'
  },
  {
    produceId: 'PROD-004',
    farmerId: 'F-1001',
    farmerName: 'Ravi Kumar',
    cropType: 'Chilli (Green)',
    quantity: 300,
    unit: 'kg',
    harvestDate: '2026-09-16',
    sourceLocation: 'Guntur Rural (Farm Plot 7)',
    storageDuration: 1,
    expectedDuration: 20,
    preferredTempMin: 7,
    preferredTempMax: 10,
    preferredHumidityMin: 85,
    preferredHumidityMax: 90,
    currentStatus: 'Pending Storage',
    spoilageRiskScore: 8,
    spoilageRiskLevel: 'LOW'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    bookingId: 'BK-9021',
    farmerId: 'F-1001',
    farmerName: 'Ravi Kumar',
    produceId: 'PROD-001',
    cropType: 'Tomato',
    quantity: 500,
    storageId: 'CS-102',
    storageName: 'Guntur Agro Freeze Hub',
    startDate: '2026-09-15',
    endDate: '2026-09-29',
    durationDays: 14,
    storageCost: 1250,
    transportCost: 700,
    totalCost: 1950,
    status: 'Active',
    isSharedTransport: true,
    transportId: 'TR-001',
    notes: 'Aggregated shared reefer with 2 other neighboring tomato farmers.'
  },
  {
    bookingId: 'BK-9018',
    farmerId: 'F-1002',
    farmerName: 'Lakshmi Devi',
    produceId: 'PROD-002',
    cropType: 'Mango',
    quantity: 1200,
    storageId: 'CS-104',
    storageName: 'Tenali Rural Cooperative Cold Chain',
    startDate: '2026-09-14',
    endDate: '2026-10-04',
    durationDays: 20,
    storageCost: 2160,
    transportCost: 950,
    totalCost: 3110,
    status: 'Active',
    isSharedTransport: false,
    transportId: 'TR-002',
    notes: 'Direct farm-to-hub express transfer.'
  },
  {
    bookingId: 'BK-9015',
    farmerId: 'F-1003',
    farmerName: 'Suresh Varma',
    produceId: 'PROD-003',
    cropType: 'Banana',
    quantity: 850,
    storageId: 'CS-101',
    storageName: 'Vijayawada Central Cold Storage',
    startDate: '2026-09-13',
    endDate: '2026-09-28',
    durationDays: 15,
    storageCost: 1870,
    transportCost: 800,
    totalCost: 2670,
    status: 'Active',
    isSharedTransport: true,
    transportId: 'TR-001'
  }
];

export const INITIAL_TRANSPORT_REQUESTS: TransportRequest[] = [
  {
    requestId: 'TR-REQ-401',
    vehicleId: 'TR-001',
    vehicleType: 'Mahindra Bolero Maxi Reefer (1,200 kg)',
    driverName: 'K. Somanna',
    driverPhone: '+91 98488 22114',
    farmerId: 'F-1001',
    farmerName: 'Ravi Kumar',
    produceId: 'PROD-001',
    cropType: 'Tomato',
    quantity: 500,
    pickupLocation: 'Guntur Rural Plot 12',
    destination: 'Guntur Agro Freeze Hub (CS-102)',
    storageName: 'Guntur Agro Freeze Hub',
    isRefrigerated: true,
    cost: 700,
    status: 'Delivered',
    distanceKm: 8.5,
    estimatedArrival: 'Delivered safely at 09:30 AM',
    isShared: true,
    sharedSavings: 1100
  },
  {
    requestId: 'TR-REQ-402',
    vehicleId: 'TR-002',
    vehicleType: 'Tata 407 Reefer Van (2,500 kg)',
    driverName: 'P. Rambabu',
    driverPhone: '+91 98485 33221',
    farmerId: 'F-1002',
    farmerName: 'Lakshmi Devi',
    produceId: 'PROD-002',
    cropType: 'Mango',
    quantity: 1200,
    pickupLocation: 'Tenali Orchard East',
    destination: 'Tenali Rural Cooperative (CS-104)',
    storageName: 'Tenali Rural Cooperative',
    isRefrigerated: true,
    cost: 950,
    status: 'Delivered',
    distanceKm: 12.0,
    estimatedArrival: 'Completed',
    isShared: false
  },
  {
    requestId: 'TR-REQ-403',
    vehicleId: 'TR-001',
    vehicleType: 'Mahindra Bolero Maxi Reefer (1,200 kg)',
    driverName: 'K. Somanna',
    driverPhone: '+91 98488 22114',
    farmerId: 'F-1001',
    farmerName: 'Ravi Kumar',
    produceId: 'PROD-004',
    cropType: 'Chilli (Green)',
    quantity: 300,
    pickupLocation: 'Guntur Rural Plot 7',
    destination: 'Amaravati Micro Cold Vault (CS-103)',
    storageName: 'Amaravati Micro Cold Vault',
    isRefrigerated: true,
    cost: 650,
    status: 'In Transit',
    distanceKm: 14.2,
    estimatedArrival: 'Today at 03:45 PM (4.2 km away)',
    isShared: true,
    sharedSavings: 850
  }
];

export const INITIAL_AGGREGATIONS: AggregatedShipment[] = [
  {
    groupId: 'AGG-GNT-TOM-01',
    cropType: 'Tomato',
    destinationHub: 'Guntur Agro Freeze Hub (CS-102)',
    storageId: 'CS-102',
    vehicleCapacity: 1200,
    totalCollected: 1000,
    maxCapacity: 1200,
    participants: [
      { farmerId: 'F-1001', farmerName: 'Ravi Kumar (Farmer A)', quantity: 400, location: 'Guntur South', joined: true },
      { farmerId: 'F-1008', farmerName: 'N. Prasad (Farmer B)', quantity: 350, location: 'Guntur West', joined: true },
      { farmerId: 'F-1009', farmerName: 'B. Venkatesh (Farmer C)', quantity: 250, location: 'Guntur East', joined: true }
    ],
    individualCostPerFarmer: 1800,
    sharedCostPerFarmer: 700,
    savingsPerFarmer: 1100,
    vehicleId: 'TR-001',
    status: 'Optimal Capacity Reached'
  },
  {
    groupId: 'AGG-BZA-BAN-02',
    cropType: 'Banana',
    destinationHub: 'Vijayawada Central Cold Storage (CS-101)',
    storageId: 'CS-101',
    vehicleCapacity: 2500,
    totalCollected: 1800,
    maxCapacity: 2500,
    participants: [
      { farmerId: 'F-1003', farmerName: 'Suresh Varma', quantity: 850, location: 'Vijayawada Outskirts', joined: true },
      { farmerId: 'F-1012', farmerName: 'V. Mallikarjun', quantity: 950, location: 'Gannavaram Belt', joined: true }
    ],
    individualCostPerFarmer: 2400,
    sharedCostPerFarmer: 1100,
    savingsPerFarmer: 1300,
    vehicleId: 'TR-002',
    status: 'Open for Aggregation'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-1',
    title: 'Storage Booking Confirmed',
    message: 'Your 500 kg Tomato booking at Guntur Agro Freeze Hub (CS-102) is confirmed under Booking #BK-9021.',
    type: 'storage',
    severity: 'success',
    timestamp: '15 mins ago',
    read: false,
    actionText: 'View Booking',
    actionView: 'bookings'
  },
  {
    id: 'NOTIF-2',
    title: 'Shared Transport Dispatched',
    message: 'Vehicle TR-001 has collected tomatoes from 3 aggregated farmers. In transit to Guntur Hub.',
    type: 'aggregation',
    severity: 'info',
    timestamp: '1 hour ago',
    read: false,
    actionText: 'Track Vehicle',
    actionView: 'tracking'
  },
  {
    id: 'NOTIF-3',
    title: 'IoT Sensor SEN-102 Calibrated',
    message: 'Cold Storage CS-102 ambient temperature stabilized at 8.4°C and 78% RH.',
    type: 'iot_alert',
    severity: 'info',
    timestamp: '3 hours ago',
    read: true,
    actionText: 'View IoT Live',
    actionView: 'iot'
  }
];

export const INITIAL_HISTORICAL_TELEMETRY: SensorTelemetryPoint[] = [
  { time: '10:00 AM', timestamp: 1773705600000, temperature: 8.0, humidity: 76, sensorId: 'SEN-102', status: 'normal' },
  { time: '10:05 AM', timestamp: 1773705900000, temperature: 8.1, humidity: 77, sensorId: 'SEN-102', status: 'normal' },
  { time: '10:10 AM', timestamp: 1773706200000, temperature: 8.2, humidity: 78, sensorId: 'SEN-102', status: 'normal' },
  { time: '10:15 AM', timestamp: 1773706500000, temperature: 8.4, humidity: 79, sensorId: 'SEN-102', status: 'normal' },
  { time: '10:20 AM', timestamp: 1773706800000, temperature: 8.3, humidity: 78, sensorId: 'SEN-102', status: 'normal' },
  { time: '10:25 AM', timestamp: 1773707100000, temperature: 8.2, humidity: 78, sensorId: 'SEN-102', status: 'normal' }
];

export const DOMAIN_CLASSES_SPEC = [
  {
    className: 'ColdChainUser',
    type: 'Abstract Base Class',
    description: 'Parent identity class defining baseline access, personal contact profile, and authentication behaviors across the cold chain network.',
    attributes: [
      { name: 'userId', type: 'string', desc: 'Unique platform identifier' },
      { name: 'name', type: 'string', desc: 'Full legal name' },
      { name: 'email', type: 'string', desc: 'Verified electronic mail' },
      { name: 'phone', type: 'string', desc: 'Mobile contact number' },
      { name: 'location', type: 'string', desc: 'Geographic base / district' },
      { name: 'password', type: 'string', desc: 'Hashed credential' },
      { name: 'role', type: 'UserRole', desc: 'farmer | operator | transport | admin' }
    ],
    operations: [
      { name: 'login()', desc: 'Authenticates user credentials and provisions role token' },
      { name: 'logout()', desc: 'Terminates active session and resets state' },
      { name: 'updateProfile()', desc: 'Updates contact info and location coordinate' }
    ]
  },
  {
    className: 'Farmer',
    type: 'Subclass of ColdChainUser',
    description: 'Represents small and marginal agricultural producers holding perishable harvests requiring cold storage and logistics.',
    attributes: [
      { name: 'farmerId', type: 'string', desc: 'Kisan / Farmer ID code' },
      { name: 'farmLocation', type: 'string', desc: 'Field coordinates and plot village' },
      { name: 'produceList', type: 'Produce[]', desc: 'Collection of harvested crop batches' }
    ],
    operations: [
      { name: 'registerProduce()', desc: 'Enters crop type, quantity, harvest date, and microclimate preferences' },
      { name: 'searchColdStorage()', desc: 'Queries compatible storages with capacity and distance metrics' },
      { name: 'bookStorage()', desc: 'Initiates reservation with duration and cost breakdown' },
      { name: 'requestTransport()', desc: 'Dispatches reefer pickup or joins shared aggregation group' },
      { name: 'viewSpoilageRisk()', desc: 'Retrieves ML risk score and recommended preservation actions' }
    ]
  },
  {
    className: 'TransportProvider',
    type: 'Subclass of ColdChainUser',
    description: 'Fleet operators offering refrigerated or insulated logistics for agricultural cold chain movement.',
    attributes: [
      { name: 'providerId', type: 'string', desc: 'Logistics company or driver ID' },
      { name: 'vehicleId', type: 'string', desc: 'Vehicle registration number' },
      { name: 'vehicleCapacity', type: 'number', desc: 'Gross payload capacity in kilograms' },
      { name: 'currentLocation', type: 'string', desc: 'Real-time GPS coordinate' },
      { name: 'availability', type: 'boolean', desc: 'Active dispatch status flag' },
      { name: 'transportationCost', type: 'number', desc: 'Calculated rate per trip / km in ₹' }
    ],
    operations: [
      { name: 'acceptTransportRequest()', desc: 'Confirms driver allocation for farmer pickup' },
      { name: 'updateVehicleLocation()', desc: 'Sends GPS waypoint telemetry to routing engine' },
      { name: 'updateTransportStatus()', desc: 'Transitions status: Requested → In Transit → Delivered' }
    ]
  },
  {
    className: 'Produce',
    type: 'Domain Entity',
    description: 'Entity encapsulating perishable agricultural commodity batches with physiological storage requirements.',
    attributes: [
      { name: 'produceId', type: 'string', desc: 'Batch identification barcode' },
      { name: 'cropType', type: 'string', desc: 'Agricultural variety (Tomato, Mango, etc.)' },
      { name: 'quantity', type: 'number', desc: 'Weight in kilograms' },
      { name: 'harvestDate', type: 'string', desc: 'Field harvesting timestamp' },
      { name: 'sourceLocation', type: 'string', desc: 'Origin farm coordinates' },
      { name: 'storageDuration', type: 'number', desc: 'Elapsed post-harvest days' },
      { name: 'currentStatus', type: 'ProduceStatus', desc: 'Harvested | Stored | In Transit | At Risk' }
    ],
    operations: [
      { name: 'calculateStorageDuration()', desc: 'Computes days in ambient vs cold conditions' },
      { name: 'updateStatus()', desc: 'Mutates lifecycle stage based on supply chain events' },
      { name: 'calculateSpoilageRisk()', desc: 'Runs predictive regression over temperature, humidity, and duration' }
    ]
  },
  {
    className: 'ColdStorage',
    type: 'Domain Entity',
    description: 'Fixed infrastructure facility providing temperature and humidity regulated chambers for perishables.',
    attributes: [
      { name: 'storageId', type: 'string', desc: 'Facility license code (CS-101 to CS-104)' },
      { name: 'name', type: 'string', desc: 'Facility branding and operator hub' },
      { name: 'location', type: 'string', desc: 'Industrial zone / cluster address' },
      { name: 'totalCapacity', type: 'number', desc: 'Max volumetric storage in kg' },
      { name: 'availableCapacity', type: 'number', desc: 'Current unoccupied kg headroom' },
      { name: 'storageCost', type: 'number', desc: 'Daily rate in ₹ / kg / day' },
      { name: 'temperature', type: 'number', desc: 'Average chamber ambient temperature (°C)' },
      { name: 'humidity', type: 'number', desc: 'Relative humidity percentage (%)' },
      { name: 'availability', type: 'boolean', desc: 'Open for public farmer booking' }
    ],
    operations: [
      { name: 'checkAvailability()', desc: 'Verifies remaining payload headroom for given batch quantity' },
      { name: 'bookStorage()', desc: 'Deducts requested quantity from available capacity' },
      { name: 'updateCapacity()', desc: 'Adjusts available space upon intake or check-out dispatch' },
      { name: 'monitorEnvironment()', desc: 'Samples IoT telemetry streams against safety thresholds' }
    ]
  },
  {
    className: 'IoTSensor',
    type: 'Hardware Interface Entity',
    description: 'Microcontroller telemetry device monitoring microclimate variables inside storage bays and reefer trucks.',
    attributes: [
      { name: 'sensorId', type: 'string', desc: 'Hardware MAC/Node ID (SEN-101 to SEN-104)' },
      { name: 'temperature', type: 'number', desc: 'Current ambient temperature in °C' },
      { name: 'humidity', type: 'number', desc: 'Relative humidity percentage in %' },
      { name: 'timestamp', type: 'string', desc: 'Transmission timestamp' },
      { name: 'sensorStatus', type: 'SensorStatus', desc: 'online | warning | critical | offline' },
      { name: 'storageId', type: 'string', desc: 'Host cold facility or reefer identifier' }
    ],
    operations: [
      { name: 'collectTemperature()', desc: 'Samples digital PT100 / DHT22 temperature transducer' },
      { name: 'collectHumidity()', desc: 'Samples capacitive hygrometer transducer' },
      { name: 'sendData()', desc: 'Transmits MQTT/REST payload to cloud IoT Gateway' },
      { name: 'generateAlert()', desc: 'Triggers push notification if readings breach crop bounds' }
    ]
  }
];
