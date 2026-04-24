import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { DomainException } from '@barterborsa/shared-core';

interface FinancialService {
  getBalance(data: { userId: string; accountType: string }): any;
  getTransactions(data: {
    userId: string;
    accountType?: string;
    page?: number;
    limit?: number;
    accountId?: string;
  }): any;
  topUpWallet(data: {
    userId: string;
    amount: string;
    paymentMethod: string;
    idempotencyKey: string;
  }): any;
  requestWithdrawal(data: {
    userId: string;
    amount: string;
    iban: string;
    accountHolder: string;
    bankName: string;
    idempotencyKey: string;
  }): any;
  getWithdrawals(data: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): any;
  getWalletRequests(data: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): any;
  processWalletRequest(data: {
    requestId: string;
    action: string;
    adminId: string;
    reason?: string;
  }): any;
}

@Injectable()
export class WalletGrpcService implements OnModuleInit {
  private readonly logger = new Logger(WalletGrpcService.name);
  private financialService!: FinancialService;

  constructor(@Inject('FINANCIAL_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.financialService =
      this.client.getService<FinancialService>('FinancialService');
  }

  async getBalance(userId: string, accountType: string = 'MAIN') {
    try {
      const response: any = await firstValueFrom(
        this.financialService.getBalance({ userId, accountType })
      );
      return response;
    } catch (error: any) {
      throw new DomainException(`Financial Service Error: ${error.message}`);
    }
  }

  async getTransactions(
    userId: string,
    accountType?: string,
    page: number = 1,
    limit: number = 20,
    accountId?: string
  ) {
    try {
      return await firstValueFrom(
        this.financialService.getTransactions({
          userId,
          accountType: accountType || '',
          page,
          limit,
          accountId: accountId || ''
        })
      );
    } catch (error: any) {
      this.logger.error(`getTransactions error: ${error.message}`);
      throw new DomainException(`Financial Service Error: ${error.message}`);
    }
  }

  async topUpWallet(
    userId: string,
    amount: string,
    paymentMethod: string,
    idempotencyKey: string
  ) {
    try {
      const response: any = await firstValueFrom(
        this.financialService.topUpWallet({
          userId, amount, paymentMethod, idempotencyKey
        })
      );
      if (!response.success) {
        throw new DomainException(response.error || 'TopUp failed');
      }
      return response;
    } catch (error: any) {
      throw new DomainException(`Financial Service Error: ${error.message}`);
    }
  }

  async requestWithdrawal(data: {
    userId: string;
    amount: string;
    iban: string;
    accountHolder: string;
    bankName: string;
    idempotencyKey: string;
  }) {
    try {
      const response: any = await firstValueFrom(
        this.financialService.requestWithdrawal(data)
      );
      if (!response.success) {
        throw new DomainException(response.error || 'Withdrawal failed');
      }
      return response;
    } catch (error: any) {
      throw new DomainException(`Financial Service Error: ${error.message}`);
    }
  }

  async getWithdrawals(
    userId?: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      return await firstValueFrom(
        this.financialService.getWithdrawals({
          userId: userId || '',
          status: status || '',
          page,
          limit
        })
      );
    } catch (error: any) {
      throw new DomainException(`Financial Service Error: ${error.message}`);
    }
  }

  async getWalletRequests(
    userId?: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      return await firstValueFrom(
        this.financialService.getWalletRequests({
          userId: userId || '',
          status: status || '',
          page,
          limit
        })
      );
    } catch (error: any) {
      throw new DomainException(`Financial Service Error: ${error.message}`);
    }
  }

  async processWalletRequest(data: {
    requestId: string;
    action: string;
    adminId: string;
    reason?: string;
  }) {
    try {
      const response: any = await firstValueFrom(
        this.financialService.processWalletRequest(data)
      );
      if (!response.success) {
        throw new DomainException(response.error || 'Request processing failed');
      }
      return response;
    } catch (error: any) {
      throw new DomainException(`Financial Service Error: ${error.message}`);
    }
  }
}
