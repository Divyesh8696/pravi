import mongoose, { Schema, Document, Types } from 'mongoose';

export type VehicleType =
  | 'AUTO_TIPPER'
  | 'COMPACTOR'
  | 'MINI_TRUCK'
  | 'HOOK_LOADER'
  | 'DUMPER_PLACER'
  | 'TRACTOR_TROLLEY'
  | 'SPECIALIZED';

export type OwnershipType = 'MUNICIPAL' | 'CONTRACTOR' | 'THIRD_PARTY';

export type VehicleStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'ON_ROUTE'
  | 'COMPLETED'
  | 'BREAKDOWN'
  | 'UNDER_MAINTENANCE'
  | 'UNAVAILABLE';

export interface IVehicle extends Document {
  code: string;
  registrationNo: string;
  vehicleType: VehicleType;
  ownership: OwnershipType;
  contractorId?: Types.ObjectId;
  zoneId: Types.ObjectId;
  capacityTonnes: number;
  capacityKg: number;
  status: VehicleStatus;
  fuelType: string;
  currentOdometer?: number;
  currentEngineHours?: number;
  lastServiceAt?: Date;
  nextServiceDueAt?: Date;
  insuranceExpiry?: Date;
  fitnessExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    registrationNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vehicleType: {
      type: String,
      enum: [
        'AUTO_TIPPER',
        'COMPACTOR',
        'MINI_TRUCK',
        'HOOK_LOADER',
        'DUMPER_PLACER',
        'TRACTOR_TROLLEY',
        'SPECIALIZED',
      ],
      required: true,
      index: true,
    },
    ownership: {
      type: String,
      enum: ['MUNICIPAL', 'CONTRACTOR', 'THIRD_PARTY'],
      required: true,
      index: true,
    },
    contractorId: { type: Schema.Types.ObjectId, ref: 'Contractor', index: true },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    capacityTonnes: { type: Number, required: true, default: 2.5 },
    capacityKg: { type: Number, required: true, default: 2500 },
    status: {
      type: String,
      enum: [
        'AVAILABLE',
        'ASSIGNED',
        'ON_ROUTE',
        'COMPLETED',
        'BREAKDOWN',
        'UNDER_MAINTENANCE',
        'UNAVAILABLE',
      ],
      default: 'AVAILABLE',
      index: true,
    },
    fuelType: { type: String, default: 'DIESEL' },
    currentOdometer: { type: Number },
    currentEngineHours: { type: Number },
    lastServiceAt: { type: Date },
    nextServiceDueAt: { type: Date },
    insuranceExpiry: { type: Date },
    fitnessExpiry: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
  }
);

VehicleSchema.index({ status: 1, zoneId: 1 });
VehicleSchema.index({ contractorId: 1, status: 1 });

export const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
