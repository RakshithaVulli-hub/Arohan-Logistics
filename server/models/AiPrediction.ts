import mongoose, { Schema, Document } from 'mongoose';

export interface IAiPrediction extends Document {
  predictionId: string;
  produceId: string;
  modelType: string;
  qualityGrade: 'A' | 'B' | 'C' | 'D';
  freshnessPercentage: number;
  spoilageRiskPercentage: number;
  confidenceScore: number;
  recommendation: string;
  isSimulated: boolean;
  createdAt: Date;
}

const AiPredictionSchema = new Schema<IAiPrediction>(
  {
    predictionId: { type: String, required: true, unique: true, trim: true },
    produceId: { type: String, required: true, trim: true },
    modelType: { type: String, required: true, trim: true },
    qualityGrade: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    freshnessPercentage: { type: Number, required: true, min: 0, max: 100 },
    spoilageRiskPercentage: { type: Number, required: true, min: 0, max: 100 },
    confidenceScore: { type: Number, required: true, min: 0, max: 1 },
    recommendation: { type: String, required: true, trim: true },
    isSimulated: { type: Boolean, required: true, default: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

AiPredictionSchema.index({ produceId: 1, createdAt: -1 });

export default mongoose.model<IAiPrediction>('AiPrediction', AiPredictionSchema);
