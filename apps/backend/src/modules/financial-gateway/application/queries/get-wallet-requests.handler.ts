import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { GetWalletRequestsQuery } from './get-wallet-requests.query';
import { User } from '@barterborsa/shared-persistence/schemas/backend/user.schema';

@QueryHandler(GetWalletRequestsQuery)
export class GetWalletRequestsHandler
  implements IQueryHandler<GetWalletRequestsQuery> {

  constructor(private readonly financialGateway: FinancialGatewayService) {}

  async execute(query: GetWalletRequestsQuery) {
    const result = (await this.financialGateway.getWalletRequests(
      query.userId,
      query.status,
      query.page,
      query.limit
    )) as any;

    if (result && result.items && result.items.length > 0) {
      const userIds = [...new Set(result.items.map((item: any) => item.userId))];
      const users = await User.find({ id: { $in: userIds as string[] } })
        .select('id email')
        .lean();

      const userMap = new Map(users.map((u: any) => [u.id, u]));

      result.items = result.items.map((item: any) => ({
        ...item,
        user: userMap.get(item.userId) || { id: item.userId, email: 'Bilinmeyen Kullanıcı' },
      }));
    }

    return result;
  }
}
