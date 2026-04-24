import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { GetWalletRequestsQuery } from './get-wallet-requests.query';
import { PrismaService } from '@barterborsa/shared-persistence';

@QueryHandler(GetWalletRequestsQuery)
export class GetWalletRequestsHandler
  implements IQueryHandler<GetWalletRequestsQuery> {

  constructor(
    private readonly financialGateway: FinancialGatewayService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: GetWalletRequestsQuery) {
    const result = (await this.financialGateway.getWalletRequests(
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
