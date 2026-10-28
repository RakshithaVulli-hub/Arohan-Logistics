import mongoose, { Schema, Document } from 'mongoose';

export interface IColdStorage extends Document {
  storageId: string;
  name: string;
  location: string;
  district: string;
  capacityKg: number;
  occupiedCapacityKg: number;
  availableCapacityKg: number;
  supportedCrops: string[];
  minimumTemperature: number;
  maximumTemperature: number;
  humidityRange: string;
  storageCostPerKg: number;
  status: 'available' | 'full' | 'maintenance';
}

const ColdStorageSchema = new Schema<IColdStorage>(
  {
    storageId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    capacityKg: { type: Number, required: true, min: 0 },
    occupiedCapacityKg: { type: Number, required: true, min: 0, default: 0 },
    availableCapacityKg: { type: Number, required: true, min: 0 },
    supportedCrops: { type: [String], default: [] },
    minimumTemperature: { type: Number, required: true },
    maximumTemperature: { type: Number, required: true },
    humidityRange: { type: String, required: true, trim: true },
    storageCostPerKg: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['available', 'full', 'maintenance'],
      default: 'available',
    },
  },
  { timestamps: false }
);

// Auto-calculate availableCapacityKg and synchronize status before saving
ColdStorageSchema.pre('save', function (next) {
  this.availableCapacityKg = this.capacityKg - this.occupiedCapacityKg;
  if (this.availableCapacityKg <= 0 && this.status === 'available') {
    this.status = 'full';
  } else if (this.availableCapacityKg > 0 && this.status === 'full') {
    this.status = 'available';
  }
  next();
});

export default mongoose.model<IColdStorage>('ColdStorage', ColdStorageSchema);
