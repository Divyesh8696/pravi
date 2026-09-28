import mongoose, { Schema, Document, Types } from 'mongoose';
import { Priority } from './types.js';

export type WorkOrderType =
  | 'RECOLLECTION'
  | 'ASSET_REPAIR'
  | 'ASSET_REPLACEMENT'
  | 'CLEANUP'
  | 'ROUTE_ISSUE'
  | 'FIELD_TASK';

export type WorkOrderSource =
  | 'MISSED_COLLECTION'
  | 'COMPLAINT'
  | 'INSPECTION'
  | 'ASSET_DAMAGE'
  | 'ROUTE_ISSUE'
  | 'SUPERVISOR_TASK';

export type WorkOrderStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'CLOSED'
  | 'REOPENED';

export type VerificationResult = 'PASSED' | 'FAILED';

export interface IWorkOrder extends Document {
  code: string;
  title: string;
  description: string;
  type: WorkOrderType;
  sourceType: WorkOrderSource;
  priority: Priority;
  status: WorkOrderStatus;
  zoneId: Types.ObjectId;
  wardId?: Types.ObjectId;
  collectionPointId?: Types.ObjectId;
  collectionEventId?: Types.ObjectId;
  operationId?: Types.ObjectId;
  routeId?: Types.ObjectId;
  inspectionId?: Types.ObjectId;
  complaintIds: Types.ObjectId[];
  assignedWorkerId?: Types.ObjectId;
  assignedContractorId?: Types.ObjectId;
  createdById: Types.ObjectId;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  completionNotes?: string;
  verificationResult?: VerificationResult;
  verificationRemarks?: string;
  verifiedById?: Types.ObjectId;
  verifiedAt?: Date;
  closedAt?: Date;
  dueAt: Date;
  reopenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'RECOLLECTION',
        'ASSET_REPAIR',
        'ASSET_REPLACEMENT',
        'CLEANUP',
        'ROUTE_ISSUE',
        'FIELD_TASK',
      ],
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: [
        'MISSED_COLLECTION',
        'COMPLAINT',
        'INSPECTION',
        'ASSET_DAMAGE',
        'ROUTE_ISSUE',
        'SUPERVISOR_TASK',
      ],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED', 'REOPENED'],
      default: 'OPEN',
      index: true,
    },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    wardId: { type: Schema.Types.ObjectId, ref: 'Ward' },
    collectionPointId: { type: Schema.Types.ObjectId, ref: 'CollectionPoint', index: true },
    collectionEventId: { type: Schema.Types.ObjectId, ref: 'CollectionEvent', index: true },
    operationId: { type: Schema.Types.ObjectId, ref: 'CollectionOperation' },
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', index: true },
    inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection' },
    complaintIds: [{ type: Schema.Types.ObjectId, ref: 'Complaint' }],
    assignedWorkerId: { type: Schema.Types.ObjectId, ref: 'Worker', index: true },
    assignedContractorId: { type: Schema.Types.ObjectId, ref: 'Contractor', index: true },
    createdById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    completionNotes: { type: String },
    verificationResult: { type: String, enum: ['PASSED', 'FAILED'] },
    verificationRemarks: { type: String },
    verifiedById: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    closedAt: { type: Date },
    dueAt: { type: Date, required: true, index: true },
    reopenCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    strict: true,
  }
);

WorkOrderSchema.index({ status: 1, priority: 1 });
WorkOrderSchema.index({ zoneId: 1, status: 1 });

export const WorkOrder = mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);
