import mongoose, { Schema, Document, Types } from 'mongoose';
import { Priority } from './types.js';

export type ComplaintCategory =
  | 'MISSED_COLLECTION'
  | 'OVERFLOWING_POINT'
  | 'DAMAGED_BIN'
  | 'WASTE_NOT_CLEARED'
  | 'ILLEGAL_DUMPING'
  | 'OTHER';

export type ComplaintChannel = 'PHONE' | 'WEB' | 'APP' | 'WALK_IN';

export type ComplaintStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'VERIFIED'
  | 'CLOSED'
  | 'REOPENED';

export interface IComplaint extends Document {
  code: string;
  category: ComplaintCategory;
  channel: ComplaintChannel;
  citizenName: string;
  citizenPhone?: string;
  reportedById?: Types.ObjectId; // User ID if submitted by logged-in citizen
  description: string;
  imageUrl?: string;
  address?: string;
  lat?: number;
  lng?: number;
  zoneId: Types.ObjectId;
  wardId: Types.ObjectId;
  collectionPointId?: Types.ObjectId;
  routeId?: Types.ObjectId;
  contractorId?: Types.ObjectId;
  priority: Priority;
  status: ComplaintStatus;
  reportedAt: Date;
  acknowledgedAt?: Date;
  assignedToId?: Types.ObjectId;
  workOrderId?: Types.ObjectId;
  resolution?: string;
  resolvedAt?: Date;
  verifiedById?: Types.ObjectId;
  verifiedAt?: Date;
  closedAt?: Date;
  dueAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: {
      type: String,
      enum: [
        'MISSED_COLLECTION',
        'OVERFLOWING_POINT',
        'DAMAGED_BIN',
        'WASTE_NOT_CLEARED',
        'ILLEGAL_DUMPING',
        'OTHER',
      ],
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['PHONE', 'WEB', 'APP', 'WALK_IN'],
      required: true,
      default: 'PHONE',
    },
    citizenName: { type: String, required: true, trim: true },
    citizenPhone: { type: String, trim: true },
    reportedById: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    wardId: { type: Schema.Types.ObjectId, ref: 'Ward', required: true, index: true },
    collectionPointId: { type: Schema.Types.ObjectId, ref: 'CollectionPoint', index: true },
    routeId: { type: Schema.Types.ObjectId, ref: 'Route', index: true }, // Sanctioned snapshot
    contractorId: { type: Schema.Types.ObjectId, ref: 'Contractor', index: true }, // Sanctioned snapshot
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'OPEN',
        'ACKNOWLEDGED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'VERIFIED',
        'CLOSED',
        'REOPENED',
      ],
      default: 'OPEN',
      index: true,
    },
    reportedAt: { type: Date, default: Date.now },
    acknowledgedAt: { type: Date },
    assignedToId: { type: Schema.Types.ObjectId, ref: 'User' },
    workOrderId: { type: Schema.Types.ObjectId, ref: 'WorkOrder', index: true },
    resolution: { type: String },
    resolvedAt: { type: Date },
    verifiedById: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    closedAt: { type: Date },
    dueAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

ComplaintSchema.index({ status: 1, priority: 1 });
ComplaintSchema.index({ zoneId: 1, status: 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
