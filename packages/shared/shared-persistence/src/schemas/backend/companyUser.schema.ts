import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/companyUser.schema.ts
import { Schema } from 'mongoose';

export const CompanyUserRole = ['OWNER','ADMIN','MEMBER'] as const;
export type CompanyUserRoleType = typeof CompanyUserRole[number];

export interface ICompanyUser {
  _id?: string;
  id: string;
  userId: string;
  companyId: string;
  role: CompanyUserRoleType;
}

export const CompanyUserSchema = new Schema<ICompanyUser>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String },
  companyId: { type: String },
  role: { type: String, enum: CompanyUserRole, default: 'MEMBER' },
}, {
  timestamps: true,
  collection: 'company_users',
});

CompanyUserSchema.index({ userId: 1, companyId: 1 }, { unique: true });
CompanyUserSchema.index({ companyId: 1 });

export const CompanyUser = createModelProxy<ICompanyUser>('CompanyUser', CompanyUserSchema);