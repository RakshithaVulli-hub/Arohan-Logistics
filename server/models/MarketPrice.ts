import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketPrice extends Document {
  cropName: string;
  marketName: string;
  district: string;
  pricePerKg: number;
  recordedAt: Date;
  dataSource: string;
}

const MarketPriceSchema = new Schema<IMarketPrice>(
  {
    cropName: { type: String, required: true, trim: true },
    marketName: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    pricePerKg: { type: Number, required: true, min: 0 },
    recordedAt: { type: Date, required: true, default: Date.now },
    // All records in this demo database are simulated — not live market data
    dataSource: { type: String, required: true, default: 'SIMULATED_DEMO_DATA', trim: true },
  },
  { timestamps: false }
);

MarketPriceSchema.index({ cropName: 1, recordedAt: -1 });

export default mongoose.model<IMarketPrice>('MarketPrice', MarketPriceSchema);
