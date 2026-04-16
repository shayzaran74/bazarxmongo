// apps/financial-service/src/modules/escrow/presentation/escrow.grpc.controller.ts

import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { CreateEscrowCommand } from '../application/commands/create-escrow.command';
import { Decimal } from 'decimal.js';

@Controller()
export class EscrowGrpcController {
  constructor(private readonly commandBus: CommandBus) {}

  @GrpcMethod('FinancialService', 'HoldFunds')
  async holdFunds(data: any) {
    try {
      const result = await this.commandBus.execute(
        new CreateEscrowCommand(
          data.referenceId, // orderId
          data.userId, // buyerId
          '', // SellerId (will be resolved in handler or passed)
          new Decimal(data.amount)
        )
      );
      
      return {
        success: true,
        holdId: result.id,
        error: '',
      };
    } catch (error: any) {
       return {
         success: false,
         holdId: '',
         error: error.message,
       };
    }
  }

  @GrpcMethod('FinancialService', 'ReleaseFunds')
  async releaseFunds(data: any) {
    return { success: true, transactionId: 'tx-release-stub' };
  }

  @GrpcMethod('FinancialService', 'RefundFunds')
  async refundFunds(data: any) {
    return { success: true, transactionId: 'tx-refund-stub' };
  }
}
