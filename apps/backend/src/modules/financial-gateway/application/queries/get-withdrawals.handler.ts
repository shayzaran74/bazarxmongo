import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialGatewayService } from '../../financial-gateway.service';
import { GetWithdrawalsQuery } from './get-withdrawals.query';

@QueryHandler(GetWithdrawalsQuery)
export class GetWithdrawalsHandler
  implements IQueryHandler<GetWithdrawalsQuery> {

  constructor(
    private readonly financialGateway: FinancialGatewayService
  ) {}

  async execute(query: GetWithdrawalsQuery) {
    return this.financialGateway.getWithdrawals(
      query.userId,
      query.status,
      query.page,
      query.limit
    );
  }
}
