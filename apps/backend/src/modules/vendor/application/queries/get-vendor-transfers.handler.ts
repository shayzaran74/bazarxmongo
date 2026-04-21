import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetVendorTransfersQuery } from './get-vendor-transfers.query';

@QueryHandler(GetVendorTransfersQuery)
export class GetVendorTransfersHandler
  implements IQueryHandler<GetVendorTransfersQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVendorTransfersQuery) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: query.userId }
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    return this.prisma.transfer.findMany({
      where: { vendorId: vendor.id },
      include: { items: { include: { listing: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
}
