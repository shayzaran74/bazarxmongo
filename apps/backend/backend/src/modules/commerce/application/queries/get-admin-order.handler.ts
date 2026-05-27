// apps/backend/src/modules/commerce/application/queries/get-admin-order.handler.ts
// GetAdminOrderHandler — Mongoose migration (ADR-005 Faz 2b)

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAdminOrderQuery } from './get-admin-order.query';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderMapper } from '../../infrastructure/persistence/mappers/order.mapper';

@QueryHandler(GetAdminOrderQuery)
export class GetAdminOrderHandler implements IQueryHandler<GetAdminOrderQuery> {
  constructor(@Inject('IOrderRepository') private readonly orderRepo: IOrderRepository) {}

  async execute(query: GetAdminOrderQuery) {
    const { orderId } = query;
    const order = await this.orderRepo.findById(orderId);
    if (!order) return null;

    const response = OrderMapper.toResponse(order);
    return OrderMapper.populateImages(response);
  }
}
