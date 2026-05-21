// apps/backend/src/modules/commerce/domain/repositories/coupon.repository.interface.ts

import { ICoupon, IEscrowCoupon } from '@barterborsa/shared-persistence';

export interface ICouponRepository {
  findByCode(code: string): Promise<ICoupon | null>;
}

export interface IEscrowCouponRepository {
  findByCartId(cartId: string): Promise<IEscrowCoupon[]>;
  findByCartIdAndCode(cartId: string, code: string): Promise<IEscrowCoupon | null>;
  create(data: {
    cartId: string;
    userId: string;
    code: string;
    discount: number;
    percentage?: number;
    minAmount?: number;
    expiresAt?: Date;
  }): Promise<IEscrowCoupon>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<IEscrowCoupon | null>;
}