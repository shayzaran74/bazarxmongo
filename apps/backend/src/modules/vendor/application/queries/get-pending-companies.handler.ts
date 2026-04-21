import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetPendingCompaniesQuery } from './get-pending-companies.query';

@QueryHandler(GetPendingCompaniesQuery)
export class GetPendingCompaniesHandler
  implements IQueryHandler<GetPendingCompaniesQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    return this.prisma.company.findMany({
      where: { status: 'PENDING' },
      include: {
        vendor: {
          include: { user: { select: { email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
