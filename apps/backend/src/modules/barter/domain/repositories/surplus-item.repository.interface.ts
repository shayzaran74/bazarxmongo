// apps/backend/src/modules/barter/domain/repositories/surplus-item.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { SurplusItem } from '../entities/surplus-item.entity';
import { Types } from 'mongoose';

export interface SurplusItemWithCompany {
  id: string;
  title: string;
  description?: string;
  quantity: Types.Decimal128;
  unitPrice: Types.Decimal128;
  materialType: string;
  location?: string;
  images?: string[];
  wantedCategories?: string[];
  tradeModes?: string[];
  technicalSpecs?: Record<string, unknown>;
  status: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

export interface SurplusItemUpdateData {
  title?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  materialType?: string;
  location?: string;
  images?: string[];
  wantedCategories?: string[];
  tradeModes?: string[];
  technicalSpecs?: Record<string, unknown>;
  status?: string;
}

export interface ISurplusItemRepository extends IRepository<SurplusItem> {
  findById(id: string): Promise<SurplusItem | null>;
  findAll(): Promise<SurplusItem[]>;
  save(item: SurplusItem): Promise<void>;
  delete(id: string): Promise<void>;
  findByCompanyId(companyId: string): Promise<SurplusItem[]>;
  findByStatus(status: string): Promise<SurplusItem[]>;
  findWithFilters(filter: Record<string, unknown>, skip: number, take: number): Promise<{ items: SurplusItem[]; total: number }>;
  findByIdWithCompany(id: string): Promise<SurplusItemWithCompany | null>;
  update(id: string, data: Partial<SurplusItemUpdateData>): Promise<SurplusItem | null>;
}
