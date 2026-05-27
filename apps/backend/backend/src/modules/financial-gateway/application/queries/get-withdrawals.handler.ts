import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { GetWithdrawalsQuery } from './get-withdrawals.query';
import { User } from '@barterborsa/shared-persistence/schemas/backend/user.schema';

interface WithdrawalItem {
  userId: string;
  [key: string]: unknown;
}

interface PaginatedWithdrawalResult {
  items: WithdrawalItem[];
  total: number;
}

@QueryHandler(GetWithdrawalsQuery)
export class GetWithdrawalsHandler
  implements IQueryHandler<GetWithdrawalsQuery> {

  constructor(private readonly financialGateway: FinancialGatewayService) {}

  async execute(query: GetWithdrawalsQuery) {
    if (!query.userId) throw new Error('userId zorunludur');
    const result = (await this.financialGateway.getWithdrawals(
      query.userId,
      query.status,
      query.page,
      query.limit
    )) as PaginatedWithdrawalResult;

    if (result && result.items && result.items.length > 0) {
      const userIds = [...new Set(result.items.map((item: WithdrawalItem) => item.userId))];
      const users = await User.find({ id: { $in: userIds } })
        .select('id email')
        .lean();

      const userMap = new Map(users.map((u: { id: string; email?: string }) => [u.id, u]));

      result.items = result.items.map((item: WithdrawalItem) => ({
        ...item,
        user: userMap.get(item.userId) || { id: item.userId, email: 'Bilinmeyen Kullanıcı' },
      }));
    }

    return result;
  }
}
