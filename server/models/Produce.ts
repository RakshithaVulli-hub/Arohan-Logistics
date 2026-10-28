import mongoose, { Schema, Document } from 'mongoose';

export type QualityGrade = 'A' | 'B' | 'C' | 'D';

export interface IProduce extends Document {
  produceId: string;
  farmerId: string;
  cropName: string;
  quantityKg: number;
  harvestDate: Date;
  location: string;
  qualityGrade?: QualityGrade;
  freshnessPercentage?: number;
  spoilageRiskPercentage?: number;
  createdAt: Date;
}

const ProduceSchema = new Schema<IProduce>(
  {
    produceId: { type: String, required: true, unique: true, trim: true },
    farmerId: { type: String, required: true, trim: true },
    cropName: { type: String, required: true, trim: true },
    quantityKg: { type: Number, required: true, min: 0 },
    harvestDate: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    qualityGrade: { type: String, enum: ['A', 'B', 'C', 'D'] },
    freshnessPercentage: { type: Number, min: 0, max: 100 },
    spoilageRiskPercentage: { type: Number, min: 0, max: 100 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default mongoose.model<IProduce>('Produce', ProduceSchema);
