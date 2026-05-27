// apps/backend/src/modules/commerce/application/queries/get-my-orders.handler.ts
// GetMyOrdersHandler — Mongoose migration (ADR-005 Faz 2b)

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMyOrdersQuery } from './get-my-orders.query';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderMapper } from '../../infrastructure/persistence/mappers/order.mapper';

@QueryHandler(GetMyOrdersQuery)
export class GetMyOrdersHandler implements IQueryHandler<GetMyOrdersQuery> {
  constructor(@Inject('IOrderRepository') private readonly orderRepo: IOrderRepository) {}

  async execute(query: GetMyOrdersQuery) {
    const result = await this.orderRepo.findByUserId(query.userId, { skip: 0, limit: 50 });
    const response = result.items.map(order => OrderMapper.toResponse(order));
    return OrderMapper.populateImages(response);
  }
}
