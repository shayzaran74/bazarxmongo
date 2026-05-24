// apps/backend/src/modules/vendor/domain/repositories/brand-ecosystem.repository.interface.ts

import { BrandEcosystem } from '../entities/brand-ecosystem.entity';

export interface BrandEcosystemDocument {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  ownerId: string;
  internalCommRate: unknown;
  isBlindPool: boolean;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrandEcosystemRepository {
  findById(id: string): Promise<BrandEcosystemDocument | null>;
  findByOwnerId(ownerId: string): Promise<BrandEcosystemDocument | null>;
  findAll(): Promise<BrandEcosystemDocument[]>;
  create(data: {
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
    internalCommRate?: number;
    isBlindPool?: boolean;
  }): Promise<BrandEcosystemDocument>;
  update(id: string, data: Partial<{
    name: string;
    description: string;
    isBlindPool: boolean;
    internalCommRate: number;
  }>): Promise<BrandEcosystemDocument | null>;
  save(entity: BrandEcosystem): Promise<BrandEcosystemDocument>;
}
