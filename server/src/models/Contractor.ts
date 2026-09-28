import mongoose, { Schema, Document } from 'mongoose';

export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'TERMINATED';

export interface IContractor extends Document {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  contractRef: string;
  contractStatus: ContractStatus;
  contractStart: Date;
  contractEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContractorSchema = new Schema<IContractor>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: { type: String },
    contractRef: { type: String, required: true, unique: true, trim: true },
    contractStatus: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'SUSPENDED', 'TERMINATED'],
      default: 'ACTIVE',
      index: true,
    },
    contractStart: { type: Date, required: true },
    contractEnd: { type: Date, required: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

export const Contractor = mongoose.model<IContractor>('Contractor', ContractorSchema);
