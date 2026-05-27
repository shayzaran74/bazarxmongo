// apps/backend/src/modules/catalog/domain/repositories/brand.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Brand } from '../entities/brand.entity';
import { Slug } from '../value-objects/slug.vo';

export interface IBrandRepository extends IRepository<Brand> {
  findBySlug(slug: Slug): Promise<Brand | null>;
  findByName(name: string): Promise<Brand | null>;
  search(params: { searchTerm?: string; skip?: number; take?: number }): Promise<{ items: Brand[]; total: number }>;
  findApproved(take: number): Promise<Brand[]>;
}
