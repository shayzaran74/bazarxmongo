// apps/backend/src/modules/bazarxgo/domain/repositories/go-coupon.repository.interface.ts

import { IGoCoupon } from '@barterborsa/shared-persistence';

export interface IGoCouponRepository {
  findAll(onlyActive?: boolean): Promise<IGoCoupon[]>;
  findByCode(code: string): Promise<IGoCoupon | null>;
  findById(id: string): Promise<IGoCoupon | null>;
  create(data: Omit<IGoCoupon, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGoCoupon>;
  update(id: string, data: Partial<IGoCoupon>): Promise<IGoCoupon | null>;
  delete(id: string): Promise<void>;
}
