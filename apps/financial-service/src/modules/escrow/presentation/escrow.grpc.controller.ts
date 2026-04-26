// apps/financial-service/src/modules/escrow/presentation/escrow.grpc.controller.ts

import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { CreateEscrowCommand } from '../application/commands/create-escrow.command';
import { ReleaseEscrowCommand } from '../application/commands/release-escrow.command';
import { RefundEscrowCommand } from '../application/commands/refund-escrow.command';
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
          data.sellerId || '', 
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
  async releaseFunds(data: { holdId?: string; idempotencyKey?: string; referenceId?: string }) {
    try {
      // Proto sometimes sends referenceId for orderId
      const orderId = data.referenceId || data.holdId; 
      if (!orderId) throw new Error('orderId (referenceId) is required');

      await this.commandBus.execute(new ReleaseEscrowCommand(orderId, data.idempotencyKey));
      return { success: true, transactionId: `rel-${orderId}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @GrpcMethod('FinancialService', 'RefundFunds')
  async refundFunds(data: { holdId?: string; idempotencyKey?: string; referenceId?: string; reason?: string }) {
    try {
      const orderId = data.referenceId || data.holdId;
      if (!orderId) throw new Error('orderId (referenceId) is required');

      await this.commandBus.execute(new RefundEscrowCommand(orderId, data.reason, data.idempotencyKey));
      return { success: true, transactionId: `ref-${orderId}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
