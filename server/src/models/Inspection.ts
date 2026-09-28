import mongoose, { Schema, Document, Types } from 'mongoose';
import { AssetCondition } from './CollectionPoint.js';

export type InspectionTarget =
  | 'COLLECTION_POINT'
  | 'VEHICLE'
  | 'TRANSFER_STATION'
  | 'COLLECTION_OPERATION';

export type InspectionResult = 'PASS' | 'NEEDS_ATTENTION' | 'FAIL';

export interface IInspection extends Document {
  code: string;
  targetType: InspectionTarget;
  targetId: Types.ObjectId;
  collectionPointId?: Types.ObjectId;
  vehicleId?: Types.ObjectId;
  transferStationId?: Types.ObjectId;
  operationId?: Types.ObjectId;
  zoneId: Types.ObjectId;
  inspectorId: Types.ObjectId;
  inspectedAt: Date;
  condition: AssetCondition;
  result: InspectionResult;
  findings: string;
  notes?: string;
  recommendedAction?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InspectionSchema = new Schema<IInspection>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    targetType: {
      type: String,
      enum: ['COLLECTION_POINT', 'VEHICLE', 'TRANSFER_STATION', 'COLLECTION_OPERATION'],
      required: true,
      index: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    collectionPointId: { type: Schema.Types.ObjectId, ref: 'CollectionPoint', index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', index: true },
    transferStationId: { type: Schema.Types.ObjectId, ref: 'TransferStation', index: true },
    operationId: { type: Schema.Types.ObjectId, ref: 'CollectionOperation' },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    inspectorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    inspectedAt: { type: Date, default: Date.now },
    condition: {
      type: String,
      enum: ['GOOD', 'FAIR', 'DAMAGED', 'MISSING'],
      required: true,
    },
    result: {
      type: String,
      enum: ['PASS', 'NEEDS_ATTENTION', 'FAIL'],
      required: true,
      index: true,
    },
    findings: { type: String, required: true },
    notes: { type: String },
    recommendedAction: { type: String },
  },
  {
    timestamps: true,
    strict: true,
  }
);

InspectionSchema.index({ targetType: 1, targetId: 1 });
InspectionSchema.index({ zoneId: 1, result: 1 });

export const Inspection = mongoose.model<IInspection>('Inspection', InspectionSchema);
