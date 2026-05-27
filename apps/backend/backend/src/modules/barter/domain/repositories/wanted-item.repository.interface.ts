// apps/backend/src/modules/barter/domain/repositories/wanted-item.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { WantedItem } from '../entities/wanted-item.entity';

export interface WantedItemDocument {
  id: string;
  categoryId: string;
  keywords: string[];
  description?: string;
  companyId?: string;
  userId: string;
  type: string;
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWantedItemRepository extends IRepository<WantedItem> {
  findById(id: string): Promise<WantedItem | null>;
  findAll(): Promise<WantedItem[]>;
  save(item: WantedItem): Promise<void>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string): Promise<WantedItemDocument[]>;
  create(data: {
    id: string;
    categoryId: string;
    keywords: string[];
    description?: string;
    companyId?: string;
    userId: string;
    type: string;
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
    status: string;
    isActive: boolean;
  }): Promise<void>;
  softDelete(id: string): Promise<void>;
}