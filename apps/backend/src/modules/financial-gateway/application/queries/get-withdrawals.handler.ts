import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { GetWithdrawalsQuery } from './get-withdrawals.query';
import { User } from '@barterborsa/shared-persistence/schemas/backend/user.schema';

@QueryHandler(GetWithdrawalsQuery)
export class GetWithdrawalsHandler
  implements IQueryHandler<GetWithdrawalsQuery> {

  constructor(private readonly financialGateway: FinancialGatewayService) {}

  async execute(query: GetWithdrawalsQuery) {
    const result = (await this.financialGateway.getWithdrawals(
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
