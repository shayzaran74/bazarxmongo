// apps/financial-service/src/modules/escrow/presentation/escrow.grpc.controller.ts

import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { CreateEscrowCommand } from '../application/commands/create-escrow.command';
import { ReleaseEscrowCommand } from '../application/commands/release-escrow.command';
import { RefundEscrowCommand } from '../application/commands/refund-escrow.command';
import { Decimal } from 'decimal.js';

interface HoldFundsRequest {
  referenceId: string;
  userId: string;
  sellerId?: string;
  amount: string;
}

interface ReleaseFundsRequest {
  holdId?: string;
  referenceId?: string;
  idempotencyKey?: string;
}

interface RefundFundsRequest {
  holdId?: string;
  referenceId?: string;
  idempotencyKey?: string;
  reason?: string;
}

function extractError(error: unknown): string {
  return error instanceof Error ? error.message : 'Bilinmeyen hata oluştu.';
}

@Controller()
export class EscrowGrpcController {
  constructor(private readonly commandBus: CommandBus) {}

  @GrpcMethod('FinancialService', 'HoldFunds')
  async holdFunds(data: HoldFundsRequest): Promise<{ success: boolean; holdId: string; error: string }> {
    // Zorunlu alan kontrolü
    if (!data.referenceId || !data.userId || !data.amount) {
      return { success: false, holdId: '', error: 'referenceId, userId ve amount zorunludur.' };
    }

    const amount = new Decimal(data.amount);
    if (!amount.isPositive()) {
      return { success: false, holdId: '', error: 'Tutar sıfırdan büyük olmalıdır.' };
    }

    try {
      const result = await this.commandBus.execute(
        new CreateEscrowCommand(
          data.referenceId,
          data.userId,
          data.sellerId || '',
          amount,
        ),
      );

      return { success: true, holdId: result.id, error: '' };
    } catch (error: unknown) {
      return { success: false, holdId: '', error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'ReleaseFunds')
  async releaseFunds(data: ReleaseFundsRequest): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    const orderId = data.referenceId || data.holdId;
    if (!orderId) {
      return { success: false, error: 'referenceId veya holdId zorunludur.' };
    }

    try {
      await this.commandBus.execute(new ReleaseEscrowCommand(orderId, data.idempotencyKey));
      return { success: true, transactionId: `rel-${orderId}` };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'RefundFunds')
  async refundFunds(data: RefundFundsRequest): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    const orderId = data.referenceId || data.holdId;
    if (!orderId) {
      return { success: false, error: 'referenceId veya holdId zorunludur.' };
    }

    try {
      await this.commandBus.execute(new RefundEscrowCommand(orderId, data.reason, data.idempotencyKey));
      return { success: true, transactionId: `ref-${orderId}` };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }
}
