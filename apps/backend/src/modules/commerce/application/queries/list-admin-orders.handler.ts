// apps/backend/src/modules/commerce/application/queries/list-admin-orders.handler.ts
// ListAdminOrdersHandler — Mongoose migration (ADR-005 Faz 2b)

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListAdminOrdersQuery } from './list-admin-orders.query';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderMapper } from '../../infrastructure/persistence/mappers/order.mapper';

@QueryHandler(ListAdminOrdersQuery)
export class ListAdminOrdersHandler implements IQueryHandler<ListAdminOrdersQuery> {
  constructor(@Inject('IOrderRepository') private readonly orderRepo: IOrderRepository) {}

  async execute(query: ListAdminOrdersQuery) {
    const { status, vendorId, page = 1, limit = 20 } = query.filters;

    const result = await this.orderRepo.findAllFiltered({
      status,
      vendorId,
      skip: (page - 1) * limit,
      limit,
    });

    const items = result.items.map(o => OrderMapper.toResponse(o));
    await OrderMapper.populateImages(items);

    return { items, total: result.total, page, limit };
  }
}
