// apps/backend/src/modules/commerce/domain/repositories/coupon.repository.interface.ts

export interface ICouponRepository {
  findByCode(code: string): Promise<any | null>;
}

export interface IEscrowCouponRepository {
  findByCartId(cartId: string): Promise<any[]>;
  findByCartIdAndCode(cartId: string, code: string): Promise<any | null>;
  create(data: {
    cartId: string;
    userId: string;
    code: string;
    discount: number;
    percentage?: number;
    minAmount?: number;
    expiresAt?: Date;
  }): Promise<any>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<any | null>;
}