import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListAdminBrandsQuery } from './list-admin-brands.query';

@QueryHandler(ListAdminBrandsQuery)
export class ListAdminBrandsHandler
  implements IQueryHandler<ListAdminBrandsQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListAdminBrandsQuery) {
    const { search, page = 1, limit = 50 } = query.filters;
    const skip = (page - 1) * limit;
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.brand.findMany({
        where, skip, take: Number(limit),
        orderBy: { name: 'asc' }
      }),
      this.prisma.brand.count({ where })
    ]);

    return { items, total, page, limit };
  }
}
