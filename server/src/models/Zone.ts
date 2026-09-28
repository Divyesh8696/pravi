import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IZone extends Document {
  cityId: Types.ObjectId;
  code: string;
  name: string;
  center: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ZoneSchema = new Schema<IZone>(
  {
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

ZoneSchema.index({ cityId: 1, code: 1 }, { unique: true });

export const Zone = mongoose.model<IZone>('Zone', ZoneSchema);
