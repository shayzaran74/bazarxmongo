// apps/backend/src/modules/barter/domain/repositories/surplus-item.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { SurplusItem } from '../entities/surplus-item.entity';

export interface ISurplusItemRepository extends IRepository<SurplusItem> {
  findById(id: string): Promise<SurplusItem | null>;
  findAll(): Promise<SurplusItem[]>;
  save(item: SurplusItem): Promise<void>;
  delete(id: string): Promise<void>;
  findByCompanyId(companyId: string): Promise<SurplusItem[]>;
  findByStatus(status: string): Promise<SurplusItem[]>;
  findWithFilters(filter: Record<string, unknown>, skip: number, take: number): Promise<{ items: SurplusItem[]; total: number }>;
  findByIdWithCompany(id: string): Promise<any | null>;
  update(id: string, data: Partial<{
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
    materialType: string;
    location: string;
    images: unknown;
    wantedCategories: unknown;
    tradeModes: unknown;
    technicalSpecs: unknown;
    status: string;
  }>): Promise<any | null>;
}
