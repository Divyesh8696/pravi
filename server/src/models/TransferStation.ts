import mongoose, { Schema, Document, Types } from 'mongoose';

export type FacilityType = 'TRANSFER_STATION' | 'PROCESSING_FACILITY' | 'DISPOSAL_SITE';
export type FacilityStatus = 'OPERATIONAL' | 'LIMITED' | 'CLOSED';

export interface ITransferStation extends Document {
  code: string;
  name: string;
  facilityType: FacilityType;
  zoneId: Types.ObjectId;
  address: string;
  lat: number;
  lng: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: FacilityStatus;
  dailyCapacityTonnes: number;
  onwardFacilityId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransferStationSchema = new Schema<ITransferStation>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    facilityType: {
      type: String,
      enum: ['TRANSFER_STATION', 'PROCESSING_FACILITY', 'DISPOSAL_SITE'],
      required: true,
      index: true,
    },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['OPERATIONAL', 'LIMITED', 'CLOSED'],
      default: 'OPERATIONAL',
      index: true,
    },
    dailyCapacityTonnes: { type: Number, required: true, default: 50 },
    onwardFacilityId: { type: Schema.Types.ObjectId, ref: 'TransferStation' },
  },
  {
    timestamps: true,
    strict: true,
  }
);

TransferStationSchema.index({ location: '2dsphere' });

export const TransferStation = mongoose.model<ITransferStation>('TransferStation', TransferStationSchema);
