// apps/backend/src/modules/commerce/application/queries/get-order-details.handler.ts
// GetOrderDetailsHandler — Mongoose migration (ADR-005 Faz 2b)

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { GetOrderDetailsQuery } from './get-order-details.query';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderMapper } from '../../infrastructure/persistence/mappers/order.mapper';

@QueryHandler(GetOrderDetailsQuery)
export class GetOrderDetailsHandler implements IQueryHandler<GetOrderDetailsQuery> {
  constructor(@Inject('IOrderRepository') private readonly orderRepo: IOrderRepository) { }

  async execute(query: GetOrderDetailsQuery) {
    console.log('[DEBUG-404] GetOrderDetailsHandler executing...', { orderId: query.orderId, userId: query.userId });
    
    // NOTE: MongoDB'de findById ile userId kontrolü ayrı yapılmalı
    const order = await this.orderRepo.findById(query.orderId);
    
    console.log('[DEBUG-404] GetOrderDetailsHandler findById result:', { 
      orderExists: !!order, 
      orderId: order?.id,
      orderUserId: order?.getProps()?.userId 
    });

    if (!order || order.getProps().userId !== query.userId) {
      console.error('[DEBUG-404] GetOrderDetailsHandler throwing NotFoundException!', { 
        orderExists: !!order, 
        orderUserId: order?.getProps()?.userId, 
        queryUserId: query.userId 
      });
      throw new NotFoundException('Sipariş bulunamadı.');
    }
    const response = OrderMapper.toResponse(order);
    return OrderMapper.populateImages(response);
  }
}
