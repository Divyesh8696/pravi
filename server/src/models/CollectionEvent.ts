import mongoose, { Schema, Document, Types } from 'mongoose';

export type CollectionStatus = 'SCHEDULED' | 'VISITED' | 'COLLECTED' | 'MISSED' | 'ISSUE_FOUND';
export type MissReason =
  | 'BLOCKED_ACCESS'
  | 'VEHICLE_FULL'
  | 'VEHICLE_BREAKDOWN'
  | 'ASSET_DAMAGED'
  | 'NOT_ACCESSIBLE'
  | 'OTHER';
export type StopResolution = 'RECOLLECTED' | 'RESOLVED_ON_SITE' | 'WAIVED';

export interface ICollectionEvent extends Document {
  operationId: Types.ObjectId;
  collectionPointId: Types.ObjectId;
  sequence: number;
  status: CollectionStatus;
  arrivedAt?: Date;
  collectedAt?: Date;
  estimatedWeightKg?: number;
  missReason?: MissReason;
  remarks?: string;
  recordedById?: Types.ObjectId;
  resolution?: StopResolution;
  resolvedAt?: Date;
  evidenceAttachmentIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CollectionEventSchema = new Schema<ICollectionEvent>(
  {
    operationId: {
      type: Schema.Types.ObjectId,
      ref: 'CollectionOperation',
      required: true,
      index: true,
    },
    collectionPointId: {
      type: Schema.Types.ObjectId,
      ref: 'CollectionPoint',
      required: true,
      index: true,
    },
    sequence: { type: Number, required: true },
    status: {
      type: String,
      enum: ['SCHEDULED', 'VISITED', 'COLLECTED', 'MISSED', 'ISSUE_FOUND'],
      default: 'SCHEDULED',
      index: true,
    },
    arrivedAt: { type: Date },
    collectedAt: { type: Date },
    estimatedWeightKg: { type: Number },
    missReason: {
      type: String,
      enum: [
        'BLOCKED_ACCESS',
        'VEHICLE_FULL',
        'VEHICLE_BREAKDOWN',
        'ASSET_DAMAGED',
        'NOT_ACCESSIBLE',
        'OTHER',
      ],
    },
    remarks: { type: String },
    recordedById: { type: Schema.Types.ObjectId, ref: 'User' },
    resolution: {
      type: String,
      enum: ['RECOLLECTED', 'RESOLVED_ON_SITE', 'WAIVED'],
    },
    resolvedAt: { type: Date },
    evidenceAttachmentIds: [{ type: Schema.Types.ObjectId, ref: 'Attachment' }],
  },
  {
    timestamps: true,
    strict: true,
  }
);

CollectionEventSchema.index({ operationId: 1, collectionPointId: 1 }, { unique: true });
CollectionEventSchema.index({ operationId: 1, sequence: 1 });
CollectionEventSchema.index({ status: 1 });

export const CollectionEvent = mongoose.model<ICollectionEvent>(
  'CollectionEvent',
  CollectionEventSchema
);
