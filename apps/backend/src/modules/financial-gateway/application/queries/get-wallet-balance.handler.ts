// apps/backend/src/modules/financial-gateway/application/queries/get-wallet-balance.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { GetWalletBalanceQuery } from './get-wallet-balance.query';

interface BalanceResponse {
  balance: string;
  availableBalance: string;
  blockedBalance: string;
}

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
    ) as BalanceResponse;
    return {
      balance: balance.balance,
      availableBalance: balance.availableBalance,
      blockedBalance: balance.blockedBalance,
      currency: 'TRY',
      accounts: [
        {
          id: 'main-account',
          type: 'MAIN',
          balance: balance.balance,
          availableBalance: balance.availableBalance,
          blockedBalance: balance.blockedBalance,
          currency: 'TRY'
        }
      ],
      cards: [],
      requests: []
    };
  }
}
