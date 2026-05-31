// apps/backend/src/modules/bazarxgo/domain/repositories/go-restaurant.repository.interface.ts

import { IGoRestaurant } from '@barterborsa/shared-persistence';

export interface GoRestaurantFilter {
  category?: string;
  isActive?: boolean;
  search?: string;
}

export interface IGoRestaurantRepository {
  findById(id: string): Promise<IGoRestaurant | null>;
  findBySlug(slug: string): Promise<IGoRestaurant | null>;
  findAll(filter: GoRestaurantFilter): Promise<IGoRestaurant[]>;
  create(data: Omit<IGoRestaurant, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGoRestaurant>;
  update(id: string, data: Partial<IGoRestaurant>): Promise<IGoRestaurant | null>;
  delete(id: string): Promise<void>;
}
