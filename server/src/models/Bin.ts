import mongoose, { Schema, Document, Types } from 'mongoose';

export type BinType = 'DUSTBIN' | 'COMMUNITY_BIN' | 'CONTAINER';
export type WasteType = 'WET' | 'DRY' | 'MIXED' | 'HAZARDOUS';
export type BinStatus = 'ACTIVE' | 'FULL' | 'OVERFLOWING' | 'MAINTENANCE' | 'INACTIVE';
export type BinCondition = 'GOOD' | 'FAIR' | 'DAMAGED' | 'MISSING';

export interface IBin extends Document {
  binId: string;
  name?: string;
  type: BinType;
  capacityLitres: number;
  wasteType: WasteType;
  lat: number;
  lng: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  zoneId: Types.ObjectId;
  wardId: Types.ObjectId;
  collectionPointId: Types.ObjectId;
  assignedRouteId?: Types.ObjectId;
  status: BinStatus;
  fillLevel: number;
  condition: BinCondition;
  lastCollectedAt?: Date;
  nextCollectionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BinSchema = new Schema<IBin>(
  {
    binId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, trim: true },
    type: {
      type: String,
      enum: ['DUSTBIN', 'COMMUNITY_BIN', 'CONTAINER'],
      required: true,
    },
    capacityLitres: { type: Number, required: true, default: 240 },
    wasteType: {
      type: String,
      enum: ['WET', 'DRY', 'MIXED', 'HAZARDOUS'],
      required: true,
    },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    wardId: { type: Schema.Types.ObjectId, ref: 'Ward', required: true, index: true },
    collectionPointId: { type: Schema.Types.ObjectId, ref: 'CollectionPoint', required: true, index: true },
    assignedRouteId: { type: Schema.Types.ObjectId, ref: 'Route', index: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'FULL', 'OVERFLOWING', 'MAINTENANCE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    fillLevel: { type: Number, min: 0, max: 100, default: 0 },
    condition: {
      type: String,
      enum: ['GOOD', 'FAIR', 'DAMAGED', 'MISSING'],
      default: 'GOOD',
    },
    lastCollectedAt: { type: Date },
    nextCollectionAt: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
  }
);

BinSchema.index({ location: '2dsphere' });
BinSchema.index({ zoneId: 1, collectionPointId: 1 });

export const Bin = mongoose.model<IBin>('Bin', BinSchema);
