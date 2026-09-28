import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  code: string;
  name: string;
  state: string;
  country: string;
  center: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema = new Schema<ICity>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    state: { type: String, required: true, default: 'Gujarat' },
    country: { type: String, required: true, default: 'India' },
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    defaultZoom: { type: Number, default: 12 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

export const City = mongoose.model<ICity>('City', CitySchema);
