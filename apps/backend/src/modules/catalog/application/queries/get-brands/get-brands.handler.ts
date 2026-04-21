import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetBrandsQuery } from './get-brands.query';

@QueryHandler(GetBrandsQuery)
export class GetBrandsHandler implements IQueryHandler<GetBrandsQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetBrandsQuery) {
    return this.prisma.brand.findMany({
      take: query.limit,
      where: { status: 'APPROVED' },
      orderBy: { name: 'asc' }
    });
  }
}
