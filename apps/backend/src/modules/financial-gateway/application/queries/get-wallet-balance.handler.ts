import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { GetWalletBalanceQuery } from './get-wallet-balance.query';

@QueryHandler(GetWalletBalanceQuery)
export class GetWalletBalanceHandler
  implements IQueryHandler<GetWalletBalanceQuery> {

  constructor(
    private readonly financialGateway: FinancialGatewayService
  ) {}

  async execute(query: GetWalletBalanceQuery) {
    const balance = await this.financialGateway.getBalance(
      query.userId,
      query.accountType
    ) as { balance: string; availableBalance: string; blockedBalance: string };
    return {
      balance: parseFloat(balance.balance),
      availableBalance: parseFloat(balance.availableBalance),
      blockedBalance: parseFloat(balance.blockedBalance),
      currency: 'TRY',
      accounts: [
        {
          id: 'main-account',
          type: 'MAIN',
          balance: parseFloat(balance.balance),
          availableBalance: parseFloat(balance.availableBalance),
          blockedBalance: parseFloat(balance.blockedBalance),
          currency: 'TRY'
        }
      ],
      cards: [],
      requests: []
    };
  }
}
