// apps/backend/src/modules/commerce/application/queries/get-my-orders.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyOrdersQuery } from './get-my-orders.query';
import { PrismaService } from '@barterborsa/shared-persistence';

@QueryHandler(GetMyOrdersQuery)
export class GetMyOrdersHandler implements IQueryHandler<GetMyOrdersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyOrdersQuery) {
    const orders = await this.prisma.order.findMany({
      where: { userId: query.userId },
      include: { 
        orderItems: true,
        dispute: {
          select: { id: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }
}
