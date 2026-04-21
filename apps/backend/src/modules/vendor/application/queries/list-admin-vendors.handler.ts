import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListAdminVendorsQuery } from './list-admin-vendors.query';

@QueryHandler(ListAdminVendorsQuery)
export class ListAdminVendorsHandler
  implements IQueryHandler<ListAdminVendorsQuery> {
  private readonly logger = new Logger(ListAdminVendorsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListAdminVendorsQuery) {
    const { search, status, page = 1, limit = 20 } = query.filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { company: { name: { contains: search, mode: 'insensitive' } } },
        { profile: { storeName: { contains: search, mode: 'insensitive' } } }
      ];
    }
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        include: {
          company: { select: { name: true, email: true, phone: true } },
          profile: true,
          categories: {
            include: {
              category: { select: { id: true, name: true, slug: true } }
            }
          },
          _count: { select: { listings: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.vendor.count({ where })
    ]);

    return {
      items: items.map(v => ({ ...v, vendorCategories: v.categories })),
      total,
      page,
      limit
    };
  }
}
