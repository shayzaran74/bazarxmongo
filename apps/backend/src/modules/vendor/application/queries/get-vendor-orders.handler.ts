import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetVendorOrdersQuery } from './get-vendor-orders.query';

@QueryHandler(GetVendorOrdersQuery)
export class GetVendorOrdersHandler
  implements IQueryHandler<GetVendorOrdersQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVendorOrdersQuery) {
    const { userId, filters } = query;
    const { status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const vendor = await this.prisma.vendor.findUnique({
      where: { userId }
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const where: any = { vendorId: vendor.id };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              listing: {
                include: {
                  catalogProduct: {
                    include: { media: { take: 1, orderBy: { sortOrder: 'asc' } } }
                  }
                }
              }
            }
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
