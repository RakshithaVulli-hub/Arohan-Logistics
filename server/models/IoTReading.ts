import mongoose, { Schema, Document } from 'mongoose';

export type AlertStatus = 'normal' | 'warning' | 'critical';

export interface IIoTReading extends Document {
  sensorId: string;
  storageId: string;
  temperature: number;
  humidity: number;
  recordedAt: Date;
  alertStatus: AlertStatus;
}

const IoTReadingSchema = new Schema<IIoTReading>(
  {
    sensorId: { type: String, required: true, trim: true },
    storageId: { type: String, required: true, trim: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true, min: 0, max: 100 },
    recordedAt: { type: Date, required: true, default: Date.now },
    alertStatus: {
      type: String,
      enum: ['normal', 'warning', 'critical'],
      default: 'normal',
    },
  },
  { timestamps: false }
);

// Index for efficient per-storage queries sorted by time
IoTReadingSchema.index({ storageId: 1, recordedAt: -1 });

export default mongoose.model<IIoTReading>('IoTReading', IoTReadingSchema);
