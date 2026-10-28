import mongoose, { Schema, Document } from 'mongoose';

export interface ITransportVehicle extends Document {
  vehicleId: string;
  providerName: string;
  vehicleType: string;
  capacityKg: number;
  currentLocation: string;
  destination?: string;
  status: 'available' | 'in_transit' | 'maintenance';
  bookingId?: string;
}

const TransportVehicleSchema = new Schema<ITransportVehicle>(
  {
    vehicleId: { type: String, required: true, unique: true, trim: true },
    providerName: { type: String, required: true, trim: true },
    vehicleType: { type: String, required: true, trim: true },
    capacityKg: { type: Number, required: true, min: 0 },
    currentLocation: { type: String, required: true, trim: true },
    destination: { type: String, trim: true },
    status: {
      type: String,
      enum: ['available', 'in_transit', 'maintenance'],
      default: 'available',
    },
    bookingId: { type: String, trim: true },
  },
  { timestamps: false }
);

export default mongoose.model<ITransportVehicle>('TransportVehicle', TransportVehicleSchema);
