// apps/backend/src/modules/commerce/domain/repositories/cart.repository.interface.ts

import { Cart } from '../entities/cart.entity';

export interface ICartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
