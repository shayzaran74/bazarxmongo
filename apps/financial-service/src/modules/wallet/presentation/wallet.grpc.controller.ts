// apps/financial-service/src/modules/wallet/presentation/wallet.grpc.controller.ts

import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { GetBalanceQuery } from '../application/queries/get-balance.query';

@Controller()
export class WalletGrpcController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @GrpcMethod('FinancialService', 'GetBalance')
  async getBalance(data: { userId: string; accountType: string }) {
    const result = await this.queryBus.execute(
      new GetBalanceQuery(data.userId, data.accountType)
    );

    return {
      balance: result.balance.toString(),
      availableBalance: result.availableBalance.toString(),
      blockedBalance: result.blockedBalance.toString(),
    };
  }

  // HoldFunds, ReleaseFunds vb. metodlar buraya eklenebilir
}
// Note: Fixed import path for GetBalanceQuery.
