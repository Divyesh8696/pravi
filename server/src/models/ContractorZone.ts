import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContractorZone extends Document {
  contractorId: Types.ObjectId;
  zoneId: Types.ObjectId;
  contractStart: Date;
  contractEnd?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContractorZoneSchema = new Schema<IContractorZone>(
  {
    contractorId: { type: Schema.Types.ObjectId, ref: 'Contractor', required: true, index: true },
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, index: true },
    contractStart: { type: Date, required: true },
    contractEnd: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

ContractorZoneSchema.index({ contractorId: 1, zoneId: 1 }, { unique: true });

export const ContractorZone = mongoose.model<IContractorZone>('ContractorZone', ContractorZoneSchema);
