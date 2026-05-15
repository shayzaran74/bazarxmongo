// apps/backend/src/modules/commerce/application/queries/list-admin-orders.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Prisma } from '@prisma/client';
import { ListAdminOrdersQuery } from './list-admin-orders.query';
import { OrderStatus } from '../../domain/enums/order-status.enum';

@QueryHandler(ListAdminOrdersQuery)
export class ListAdminOrdersHandler implements IQueryHandler<ListAdminOrdersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListAdminOrdersQuery) {
    const { status, vendorId, search, page = 1, limit = 20 } = query.filters;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status as OrderStatus;
    }
    if (vendorId) where.vendorId = vendorId;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { profile: { firstName: { contains: search, mode: 'insensitive' } } } },
        { user: { profile: { lastName: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          orderItems: true,
          statusHistory: true,
          user: {
            select: {
              email: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
          vendor: {
            include: { company: { select: { name: true } } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}
