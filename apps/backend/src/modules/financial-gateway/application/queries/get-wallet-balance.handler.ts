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
    const balance: any = await this.financialGateway.getBalance(
      query.userId,
      query.accountType
    );
    return {
      balance: parseFloat(balance.balance),
      availableBalance: parseFloat(balance.availableBalance),
      blockedBalance: parseFloat(balance.blockedBalance),
      currency: 'TRY',
      accounts: [],
      cards: [],
      requests: []
    };
  }
}
