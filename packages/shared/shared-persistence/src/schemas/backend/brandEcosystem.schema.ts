import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// BrandEcosystem — generated from Prisma schema
// TODO: strict typing — codegen

export interface IBrandEcosystem {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  createdAt: Date;
  internalCommRate: Types.Decimal128;
  isBlindPool: boolean;
  logoUrl?: string;
  ownerId: string;
  maxMembers: number;
  updatedAt: Date;
}

export const BrandEcosystemSchema = new Schema<IBrandEcosystem>({
  _id: { type: String },
  id: { type: String, required: true },
  name: { type: String },
  slug: { type: String },
  description: { type: String },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: Date, alias: 'created_at' },
  internalCommRate: { type: Types.Decimal128, default: 4.0, alias: 'internal_comm_rate' },
  isBlindPool: { type: Boolean, default: true, alias: 'is_blind_pool' },
  logoUrl: { type: String, alias: 'logo_url' },
  ownerId: { type: String, alias: 'owner_id' },
  maxMembers: { type: Number, default: 50, alias: 'max_members' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'brand_ecosystems',
});

export const BrandEcosystem = createModelProxy<IBrandEcosystem>('BrandEcosystem', BrandEcosystemSchema);
