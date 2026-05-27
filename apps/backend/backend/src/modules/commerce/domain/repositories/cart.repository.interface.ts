// apps/backend/src/modules/commerce/domain/repositories/cart.repository.interface.ts
// ICartRepository — Mongoose migration (ADR-005 Faz 2b)

import { Cart } from '../entities/cart.entity';

export interface ICartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  findOrCreate(userId: string): Promise<Cart>;
  save(cart: Cart): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  clearItems(userId: string): Promise<void>;
}
