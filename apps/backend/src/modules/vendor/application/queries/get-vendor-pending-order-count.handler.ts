import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetVendorPendingOrderCountQuery }
  from './get-vendor-pending-order-count.query';

@QueryHandler(GetVendorPendingOrderCountQuery)
export class GetVendorPendingOrderCountHandler
  implements IQueryHandler<GetVendorPendingOrderCountQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVendorPendingOrderCountQuery) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: query.userId }
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    return this.prisma.order.count({
      where: { vendorId: vendor.id, status: 'PENDING' }
    });
  }
}
