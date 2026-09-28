import mongoose, { Schema, Document, Types } from 'mongoose';

export type CollectionAssetType =
  | 'GARBAGE_BIN'
  | 'COMMUNITY_POINT'
  | 'WASTE_CONTAINER'
  | 'WET_WASTE_POINT'
  | 'DRY_WASTE_POINT'
  | 'BULK_WASTE_POINT'
  | 'SECONDARY_POINT';

export type WasteType = 'WET' | 'DRY' | 'MIXED' | 'BULK';
export type AssetCondition = 'GOOD' | 'FAIR' | 'DAMAGED' | 'MISSING';
export type AssetLifecycle =
  | 'PLANNED'
  | 'REGISTERED'
  | 'INSTALLED'
  | 'ACTIVE'
  | 'UNDER_MAINTENANCE'
  | 'RETIRED'
  | 'DISPOSED';

export interface ICollectionPoint extends Document {
  code: string;
  name: string;
  assetType: CollectionAssetType;
  wasteType: WasteType;
  zoneId: Types.ObjectId;
  wardId: Types.ObjectId;
  address: string;
  lat: number;
  lng: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  capacityLitres: number;
  condition: AssetCondition;
  lifecycleStatus: AssetLifecycle;
  registeredAt: Date;
  installedAt?: Date;
  lastCollectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionPointSchema = new Schema<ICollectionPoint>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    assetType: {
      type: String,
      enum: [
        'GARBAGE_BIN',
        'COMMUNITY_POINT',
        'WASTE_CONTAINER',
        'WET_WASTE_POINT',
        'DRY_WASTE_POINT',
        'BULK_WASTE_POINT',
        'SECONDARY_POINT',
      ],
      required: true,
    },
    wasteType: {
      type: String,
      enum: ['WET', 'DRY', 'MIXED', 'BULK'],
      required: true,
    },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    wardId: { type: Schema.Types.ObjectId, ref: 'Ward', required: true, index: true },
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
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    capacityLitres: { type: Number, required: true, default: 240 },
    condition: {
      type: String,
      enum: ['GOOD', 'FAIR', 'DAMAGED', 'MISSING'],
      default: 'GOOD',
      index: true,
    },
    lifecycleStatus: {
      type: String,
      enum: [
        'PLANNED',
        'REGISTERED',
        'INSTALLED',
        'ACTIVE',
        'UNDER_MAINTENANCE',
        'RETIRED',
        'DISPOSED',
      ],
      default: 'ACTIVE',
      index: true,
    },
    registeredAt: { type: Date, default: Date.now },
    installedAt: { type: Date },
    lastCollectedAt: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
  }
);

CollectionPointSchema.index({ location: '2dsphere' });
CollectionPointSchema.index({ zoneId: 1, wardId: 1 });
CollectionPointSchema.index({ lifecycleStatus: 1, condition: 1 });

export const CollectionPoint = mongoose.model<ICollectionPoint>('CollectionPoint', CollectionPointSchema);
