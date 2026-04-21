import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetMyCompanyQuery } from './get-my-company.query';

@QueryHandler(GetMyCompanyQuery)
export class GetMyCompanyHandler
  implements IQueryHandler<GetMyCompanyQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyCompanyQuery) {
    const { userId, userRole } = query;

    const vendor = await this.prisma.vendor.findUnique({
      where: { userId }
    });

    if (!vendor) {
      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        return { isSystemAdmin: true, companyId: null };
      }
      return null;
    }

    if (!vendor.companyId) return null;

    return { companyId: vendor.companyId, isSystemAdmin: false };
  }
}
