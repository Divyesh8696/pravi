import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoute extends Document {
  code: string;
  name: string;
  zoneId: Types.ObjectId;
  primaryWardId?: Types.ObjectId;
  shiftId: Types.ObjectId;
  contractorId?: Types.ObjectId;
  destinationId?: Types.ObjectId;
  plannedStartTime: string; // "06:00"
  plannedEndTime: string; // "10:30"
  operatingDays: number[]; // 0=Sun ... 6=Sat
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    primaryWardId: { type: Schema.Types.ObjectId, ref: 'Ward' },
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift', required: true, index: true },
    contractorId: { type: Schema.Types.ObjectId, ref: 'Contractor', index: true },
    destinationId: { type: Schema.Types.ObjectId, ref: 'TransferStation', index: true },
    plannedStartTime: { type: String, required: true, default: '06:00' },
    plannedEndTime: { type: String, required: true, default: '10:30' },
    operatingDays: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

RouteSchema.index({ zoneId: 1, shiftId: 1 });

export const Route = mongoose.model<IRoute>('Route', RouteSchema);
