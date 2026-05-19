// packages/shared/shared-persistence/src/schemas/backend/company.schema.ts
import { Schema, model, Types } from 'mongoose';

export const CompanyStatus = ['PENDING','APPROVED','REJECTED','SUSPENDED'] as const;
export type CompanyStatusType = typeof CompanyStatus[number];

export interface ICompany {
  _id?: string;
  id: string;
  vendorId?: string;
  taxNumber?: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  registrationNumber?: string;
  taxOffice?: string;
  representativeName?: string;
  representativePhone?: string;
  vatRate: Types.Decimal128;
  status: CompanyStatusType;
  verifiedAt?: Date;
  companyType?: string;
  tradeRegistryNumber?: string;
  mersisNumber?: string;
  kepAddress?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = new Schema<ICompany>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String, alias: 'vendor_id' },
  taxNumber: { type: String },
  name: { type: String },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  logo: { type: String },
  registrationNumber: { type: String },
  taxOffice: { type: String },
  representativeName: { type: String },
  representativePhone: { type: String },
  vatRate: { type: Types.Decimal128, default: Types.Decimal128.fromString('20') },
  status: { type: String, enum: CompanyStatus, default: 'PENDING' },
  verifiedAt: { type: Date },
  companyType: { type: String },
  tradeRegistryNumber: { type: String },
  mersisNumber: { type: String },
  kepAddress: { type: String },
  deletedAt: { type: Date },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'companies',
});

CompanySchema.index({ taxNumber: 1 });
CompanySchema.index({ status: 1 });
CompanySchema.index({ deletedAt: 1 });

export const Company = model<ICompany>('Company', CompanySchema);