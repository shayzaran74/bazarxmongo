import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { GetWithdrawalsQuery } from './get-withdrawals.query';
import { PrismaService } from '@barterborsa/shared-persistence';

@QueryHandler(GetWithdrawalsQuery)
export class GetWithdrawalsHandler
  implements IQueryHandler<GetWithdrawalsQuery> {

  constructor(
    private readonly financialGateway: FinancialGatewayService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: GetWithdrawalsQuery) {
    const result = (await this.financialGateway.getWithdrawals(
      query.userId,
      query.status,
      query.page,
      query.limit
    )) as any;

    if (result && result.items && result.items.length > 0) {
      const userIds = [...new Set(result.items.map((item: any) => item.userId))];
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds as string[] } },
        select: { id: true, email: true },
      });

      const userMap = new Map(users.map(u => [u.id, u]));

      result.items = result.items.map((item: any) => ({
        ...item,
        user: userMap.get(item.userId) || { id: item.userId, email: 'Bilinmeyen Kullanıcı' },
      }));
    }

    return result;
  }
}
