import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { GetWalletTransactionsQuery } from './get-wallet-transactions.query';

@QueryHandler(GetWalletTransactionsQuery)
export class GetWalletTransactionsHandler
  implements IQueryHandler<GetWalletTransactionsQuery> {

  constructor(
    private readonly financialGateway: FinancialGatewayService
  ) {}

  async execute(query: GetWalletTransactionsQuery) {
    return this.financialGateway.getTransactions(
      query.userId,
      query.accountType,
      query.page,
      query.limit,
      query.accountId
    );
  }
}
