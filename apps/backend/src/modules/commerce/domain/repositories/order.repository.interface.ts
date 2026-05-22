// apps/backend/src/modules/commerce/domain/repositories/order.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Order } from '../entities/order.entity';

export interface IOrderRepository extends IRepository<Order> {
  findByUserId(userId: string, pagination?: { skip?: number; limit?: number }): Promise<{ items: Order[]; total: number }>;
  findByVendorId(vendorId: string, pagination?: { skip?: number; limit?: number }): Promise<{ items: Order[]; total: number }>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByIdempotencyKey(userId: string, key: string): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  findAllFiltered(params: { status?: string; vendorId?: string; skip?: number; limit?: number }): Promise<{ items: Order[]; total: number }>;
  create(order: Order): Promise<void>;
  updateStatus(orderId: string, status: string): Promise<void>;
  updatePaid(orderId: string, escrowHoldId: string): Promise<void>;
  updateOne(orderId: string, data: Record<string, unknown>): Promise<void>;
  decrementStock(listingId: string, quantity: number): Promise<boolean>;
  incrementStock(listingId: string, quantity: number): Promise<void>;
  findExpiredPending(now: Date): Promise<Order[]>;
}
