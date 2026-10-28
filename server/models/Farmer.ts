import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmer extends Document {
  farmerId: string;
  name: string;
  phone?: string;
  village: string;
  district: string;
  landArea: number;
  crops: string[];
  createdAt: Date;
}

const FarmerSchema = new Schema<IFarmer>(
  {
    farmerId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    village: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    landArea: { type: Number, required: true, min: 0 },
    crops: { type: [String], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default mongoose.model<IFarmer>('Farmer', FarmerSchema);
