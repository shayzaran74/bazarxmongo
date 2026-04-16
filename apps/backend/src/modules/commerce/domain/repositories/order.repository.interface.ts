// apps/backend/src/modules/commerce/domain/repositories/order.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';

export interface IOrderRepository extends IRepository<Order> {
  findByUserId(userId: string, pagination: any): Promise<{ items: Order[]; total: number }>;
  findByVendorId(vendorId: string, pagination: any): Promise<{ items: Order[]; total: number }>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  // Additional filters can be added here
}
