// apps/backend/src/modules/vendor/domain/repositories/i-ecosystem-order.repository.ts

import { ClientSession } from 'mongoose';

export interface CreateEcosystemOrderDto {
  dealerId: string;
  ecosystemId: string;
  productId: string;
  orderId: string;
  quantity: number;
  unitPrice: string; // Decimal128 as string
  isGarageSale: boolean;
  garageSaleId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface IEcosystemOrderRepository {
  create(
    data: CreateEcosystemOrderDto,
    options?: { session?: ClientSession },
  ): Promise<{ id: string; dealerId: string; ecosystemId: string; orderId: string; status: string }>;

  /**
   * Ekosistem detaylarını getirir — internalCommRate için kullanılır.
   * CheckoutService'deki fragile cast yerine bu metod kullanılmalı.
   */
  findEcosystemById(ecosystemId: string): Promise<{ id: string; internalCommRate: number } | null>;

  sumQuantityByDealerAndProduct(
    dealerId: string,
    productId: string,
    statuses: string[],
    session: ClientSession,
  ): Promise<number>;

  findByEcosystemId(
    ecosystemId: string,
    limit?: number,
  ): Promise<Array<{
    id: string;
    dealerId: string;
    ecosystemId: string;
    productId: string;
    orderId: string;
    quantity: number;
    status: string;
    isGarageSale: boolean;
    garageSaleId?: string;
    createdAt: Date;
  }>>;

  findByDealerId(
    dealerId: string,
    ecosystemId?: string,
  ): Promise<Array<{
    id: string;
    dealerId: string;
    ecosystemId: string;
    productId: string;
    orderId: string;
    quantity: number;
    status: string;
    isGarageSale: boolean;
    garageSaleId?: string;
    createdAt: Date;
  }>>;

  updateStatus(
    orderId: string,
    status: 'CONFIRMED' | 'CANCELLED',
    options?: { session?: ClientSession },
  ): Promise<void>;
}