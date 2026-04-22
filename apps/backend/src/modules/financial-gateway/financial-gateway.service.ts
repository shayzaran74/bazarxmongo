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
  async getBalance(userId: string, accountType: string = 'MAIN') {
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

  // YENİ metodlar:
  async getTransactions(
    userId: string,
    accountType?: string,
    page: number = 1,
    limit: number = 20
  ) {
    return this.walletService.getTransactions(userId, accountType, page, limit);
  }

  async topUpWallet(
    userId: string,
    amount: string,
    paymentMethod: string,
    idempotencyKey: string
  ) {
    return this.walletService.topUpWallet(
      userId, amount, paymentMethod, idempotencyKey
    );
  }

  async requestWithdrawal(data: {
    userId: string;
    amount: string;
    iban: string;
    accountHolder: string;
    bankName: string;
    idempotencyKey: string;
  }) {
    return this.walletService.requestWithdrawal(data);
  }

  async getWithdrawals(
    userId?: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ) {
    return this.walletService.getWithdrawals(userId, status, page, limit);
  }

  async getWalletRequests(
    userId?: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) {
    return this.walletService.getWalletRequests(userId, status, page, limit);
  }
}
