import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { GetWalletRequestsQuery } from './get-wallet-requests.query';

@QueryHandler(GetWalletRequestsQuery)
export class GetWalletRequestsHandler
  implements IQueryHandler<GetWalletRequestsQuery> {

  constructor(
    private readonly financialGateway: FinancialGatewayService
  ) {}

  async execute(query: GetWalletRequestsQuery) {
    return this.financialGateway.getWalletRequests(
      query.userId,
      query.status,
      query.page,
      query.limit
    );
  }
}
