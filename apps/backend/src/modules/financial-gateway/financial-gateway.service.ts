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

  async getWallet(userId: string) {
    return this.walletService.getWallet(userId);
  }

  async checkBalance(userId: string, requiredAmount: string, accountType: string = 'MAIN'): Promise<{ sufficient: boolean; currentBalance: string }> {
    const balanceResponse = await this.walletService.getBalance(userId, accountType);
    const currentBalance = (balanceResponse as any)?.balance ?? '0';
    const balance = parseFloat(currentBalance);
    const required = parseFloat(requiredAmount);
    return {
      sufficient: balance >= required,
      currentBalance,
    };
  }

  // Escrow Methods
  async holdFunds(userId: string, amount: string, reason: string, referenceId: string, referenceType: string, idempotencyKey: string, sellerId: string = '') {
    return this.escrowService.holdFunds(userId, amount, reason, referenceId, referenceType, idempotencyKey, sellerId);
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
    limit: number = 20,
    accountId?: string
  ) {
    return this.walletService.getTransactions(userId, accountType, page, limit, accountId);
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
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ) {
    return this.walletService.getWithdrawals(userId, status, page, limit);
  }

  async getWalletRequests(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) {
    return this.walletService.getWalletRequests(userId, status, page, limit);
  }

  async processWalletRequest(data: {
    requestId: string;
    action: string;
    adminId: string;
    reason?: string;
  }) {
    return this.walletService.processWalletRequest(data);
  }

  async processWithdrawal(data: {
    withdrawalId: string;
    action: string;
    adminId: string;
    reason?: string;
  }) {
    return this.walletService.processWithdrawal(data);
  }

  async createGiftCard(data: {
    code: string;
    amount: string;
    expiresAt?: string;
    customerId?: string;
    note?: string;
  }) {
    return this.walletService.createGiftCard(data);
  }

  async listGiftCards(data: {
    customerId: string;
    page?: number;
    limit?: number;
  }) {
    return this.walletService.listGiftCards(data);
  }

  async getGiftCard(id: string) {
    return this.walletService.getGiftCard(id);
  }
  
  async transferBetweenAccounts(data: {
    userId: string;
    fromAccountType: string;
    toAccountType: string;
    amount: string;
    note?: string;
  }) {
    return this.walletService.transferBetweenAccounts(data);
  }
}
