import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListAdminOrdersQuery } from './list-admin-orders.query';

@QueryHandler(ListAdminOrdersQuery)
export class ListAdminOrdersHandler
  implements IQueryHandler<ListAdminOrdersQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListAdminOrdersQuery) {
    const { status, vendorId, page = 1, limit = 20 } = query.filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          orderItems: true,
          statusHistory: true,
          vendor: {
            include: { company: { select: { name: true } } }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.order.count({ where })
    ]);

    return { items, total, page, limit };
  }
}
