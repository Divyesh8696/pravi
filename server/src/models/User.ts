import mongoose, { Schema, Document, Types } from 'mongoose';

export type RoleKey = 'ADMIN' | 'OPS_MANAGER' | 'ZONE_SUPERVISOR' | 'FIELD_WORKER' | 'CONTRACTOR' | 'MANAGEMENT' | 'CITIZEN';

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: RoleKey;
  isActive: boolean;
  zoneId?: Types.ObjectId;
  contractorId?: Types.ObjectId;
  workerId?: Types.ObjectId;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'OPS_MANAGER', 'ZONE_SUPERVISOR', 'FIELD_WORKER', 'CONTRACTOR', 'MANAGEMENT', 'CITIZEN'],
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', index: true },
    contractorId: { type: Schema.Types.ObjectId, ref: 'Contractor', index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'Worker', index: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
