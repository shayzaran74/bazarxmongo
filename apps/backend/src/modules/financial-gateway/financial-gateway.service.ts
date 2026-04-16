// apps/backend/src/modules/financial-gateway/financial-gateway.service.ts

import { Injectable } from '@nestjs/common';
import { WalletGrpcService } from './grpc/wallet-grpc.service';
import { EscrowGrpcService } from './grpc/escrow-grpc.service';

@Injectable()
export class FinancialGatewayService {
  constructor(
    private readonly walletService: WalletGrpcService,
    private readonly escrowService: EscrowGrpcService,
  ) {}

  // Wallet Methods
  async getBalance(userId: string, accountType: string = 'TRY') {
    return this.walletService.getBalance(userId, accountType);
  }

  // Escrow Methods
  async holdFunds(userId: string, amount: string, reason: string, referenceId: string, referenceType: string, idempotencyKey: string) {
    return this.escrowService.holdFunds(userId, amount, reason, referenceId, referenceType, idempotencyKey);
  }

  async releaseFunds(holdId: string, idempotencyKey: string) {
    return this.escrowService.releaseFunds(holdId, idempotencyKey);
  }

  async refundFunds(holdId: string, idempotencyKey: string) {
    return this.escrowService.refundFunds(holdId, idempotencyKey);
  }
}
