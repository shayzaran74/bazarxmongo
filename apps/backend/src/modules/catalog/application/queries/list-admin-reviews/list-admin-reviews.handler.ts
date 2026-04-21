import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ListAdminReviewsQuery } from './list-admin-reviews.query';

@QueryHandler(ListAdminReviewsQuery)
export class ListAdminReviewsHandler
  implements IQueryHandler<ListAdminReviewsQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListAdminReviewsQuery) {
    const { page = 1, limit = 10 } = query.filters;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        include: {
          catalogProduct: { select: { name: true } },
          order: { select: { id: true, orderNumber: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.review.count()
    ]);

    return { items, total, page, limit };
  }
}
