import mongoose, { Schema, Document } from 'mongoose';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_transit'
  | 'completed'
  | 'cancelled';

export interface IBooking extends Document {
  bookingId: string;
  farmerId: string;
  produceId: string;
  storageId: string;
  vehicleId?: string;
  quantityKg: number;
  pickupLocation: string;
  destination: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: { type: String, required: true, unique: true, trim: true },
    farmerId: { type: String, required: true, trim: true },
    produceId: { type: String, required: true, trim: true },
    storageId: { type: String, required: true, trim: true },
    vehicleId: { type: String, trim: true },
    quantityKg: { type: Number, required: true, min: 0 },
    pickupLocation: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_transit', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
