import mongoose, { Schema, Document, Types } from 'mongoose';
import { RoleKey } from './User.js';

export type EntityType = 'ROUTE' | 'VEHICLE' | 'BIN' | 'COLLECTION_POINT' | 'COMPLAINT' | 'WORK_ORDER' | 'INSPECTION' | 'CONTRACTOR' | 'USER' | 'OTHER';


export interface IAuditLog extends Document {
  actorId?: string; // FK-free to survive user deletion
  actorName: string;
  actorRole?: RoleKey;
  action: string;
  entityType: EntityType;
  entityId: Types.ObjectId;
  entityCode?: string;
  summary: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: String, index: true },
    actorName: { type: String, required: true },
    actorRole: { type: String },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    entityCode: { type: String },
    summary: { type: String, required: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    strict: true,
  }
);

AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
