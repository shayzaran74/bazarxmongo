import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetLoginHistoryQuery } from './get-login-history.query';
import { Result, Ok } from '@barterborsa/shared-core';

@QueryHandler(GetLoginHistoryQuery)
export class GetLoginHistoryHandler implements IQueryHandler<GetLoginHistoryQuery, Result<any[]>> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLoginHistoryQuery): Promise<Result<any[]>> {
    const history = await this.prisma.loginHistory.findMany({
      where: { userId: query.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return Ok(history);
  }
}
