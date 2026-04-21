import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetEcosystemAuditLogsQuery } from './get-ecosystem-audit-logs.query';

@QueryHandler(GetEcosystemAuditLogsQuery)
export class GetEcosystemAuditLogsHandler
  implements IQueryHandler<GetEcosystemAuditLogsQuery> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEcosystemAuditLogsQuery) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: query.userId },
      include: { brandEcosystem: true }
    });

    if (!vendor?.brandEcosystem) return [];

    return this.prisma.ecosystemAuditLog.findMany({
      where: { ecosystemId: vendor.brandEcosystem.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }
}
