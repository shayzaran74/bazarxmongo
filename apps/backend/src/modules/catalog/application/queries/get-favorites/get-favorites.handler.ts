import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetFavoritesQuery } from './get-favorites.query';

@QueryHandler(GetFavoritesQuery)
export class GetFavoritesHandler implements IQueryHandler<GetFavoritesQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetFavoritesQuery) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId: query.userId },
      include: { product: true }
    });
    return favorites.map(f => f.product);
  }
}
