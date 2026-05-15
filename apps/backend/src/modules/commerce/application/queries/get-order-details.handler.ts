// apps/backend/src/modules/commerce/application/queries/get-order-details.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrderDetailsQuery } from './get-order-details.query';
import { PrismaService } from '@barterborsa/shared-persistence';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetOrderDetailsQuery)
export class GetOrderDetailsHandler implements IQueryHandler<GetOrderDetailsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetOrderDetailsQuery) {
    const order = await this.prisma.order.findFirst({
      where: { 
        id: query.orderId,
        userId: query.userId 
      },
      include: { 
        orderItems: {
          include: {
            listing: {
              include: {
                catalogProduct: {
                  include: {
                    media: {
                      orderBy: { sortOrder: 'asc' },
                      take: 1
                    }
                  }
                }
              }
            }
          }
        },
        dispute: true
      },
    });

    if (!order) throw new NotFoundException('Sipariş bulunamadı.');

    return order;
  }
}
