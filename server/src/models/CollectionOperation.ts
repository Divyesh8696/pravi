import mongoose, { Schema, Document, Types } from 'mongoose';

export type OperationStatus =
  | 'PLANNED'
  | 'ASSIGNED'
  | 'STARTED'
  | 'IN_PROGRESS'
  | 'PARTIALLY_COMPLETED'
  | 'REVIEW_REASSIGNMENT'
  | 'COMPLETED'
  | 'PAUSED'
  | 'CANCELLED';

export interface ICollectionOperation extends Document {
  code: string;
  routeId: Types.ObjectId;
  date: Date;
  shiftId: Types.ObjectId;
  vehicleId?: Types.ObjectId;
  driverId?: Types.ObjectId;
  status: OperationStatus;
  plannedStartAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  totalStops: number;
  collectedCount: number;
  missedCount: number;
  issueCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionOperationSchema = new Schema<ICollectionOperation>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    date: { type: Date, required: true, index: true },
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift', required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Worker', index: true },
    status: {
      type: String,
      enum: [
        'PLANNED',
        'ASSIGNED',
        'STARTED',
        'IN_PROGRESS',
        'PARTIALLY_COMPLETED',
        'REVIEW_REASSIGNMENT',
        'COMPLETED',
        'PAUSED',
        'CANCELLED',
      ],
      default: 'PLANNED',
      index: true,
    },
    plannedStartAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    notes: { type: String },
    totalStops: { type: Number, default: 0 },
    collectedCount: { type: Number, default: 0 },
    missedCount: { type: Number, default: 0 },
    issueCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    strict: true,
  }
);

CollectionOperationSchema.index({ routeId: 1, date: 1, shiftId: 1 }, { unique: true });
CollectionOperationSchema.index({ date: 1, status: 1 });
CollectionOperationSchema.index({ vehicleId: 1, date: 1 });
CollectionOperationSchema.index({ driverId: 1, date: 1 });

export const CollectionOperation = mongoose.model<ICollectionOperation>(
  'CollectionOperation',
  CollectionOperationSchema
);
