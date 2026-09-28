import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWard extends Document {
  zoneId: Types.ObjectId;
  code: string;
  name: string;
  number: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WardSchema = new Schema<IWard>(
  {
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    number: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

WardSchema.index({ zoneId: 1, number: 1 }, { unique: true });

export const Ward = mongoose.model<IWard>('Ward', WardSchema);
