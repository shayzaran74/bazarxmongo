import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { DomainException } from '@barterborsa/shared-core';
import { CircuitBreakerService } from '../../../common/resilience/circuit-breaker.service';

export interface GrpcSuccessResponse {
  success: boolean;
  error?: string;
}

export interface WalletDataResponse {
  balance: string;
  currency: string;
  [key: string]: unknown;
}

export interface TransactionsResponse {
  transactions: unknown[];
  total: number;
}

export interface PaginatedResponse {
  items: unknown[];
  total: number;
}

interface FinancialService {
  getWallet(data: { userId: string }): Observable<WalletDataResponse>;
  getBalance(data: { userId: string; accountType: string }): Observable<WalletDataResponse>;
  getTransactions(data: {
    userId: string;
    accountType?: string;
    page?: number;
    limit?: number;
    accountId?: string;
  }): Observable<TransactionsResponse>;
  topUpWallet(data: {
    userId: string;
    amount: string;
    paymentMethod: string;
    idempotencyKey: string;
  }): Observable<GrpcSuccessResponse>;
  requestWithdrawal(data: {
    userId: string;
    amount: string;
    iban: string;
    accountHolder: string;
    bankName: string;
    idempotencyKey: string;
  }): Observable<GrpcSuccessResponse>;
  getWithdrawals(data: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse>;
  getWalletRequests(data: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse>;
  processWalletRequest(data: {
    requestId: string;
    action: string;
    adminId: string;
    reason?: string;
  }): Observable<GrpcSuccessResponse>;
  processWithdrawal(data: {
    withdrawalId: string;
    action: string;
    adminId: string;
    reason?: string;
  }): Observable<GrpcSuccessResponse>;
  createGiftCard(data: {
    code: string;
    amount: string;
    expiresAt?: string;
    customerId?: string;
    note?: string;
  }): Observable<GrpcSuccessResponse>;
  listGiftCards(data: {
    customerId?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse>;
  getGiftCard(data: { id: string }): Observable<WalletDataResponse>;
  transferBetweenAccounts(data: {
    userId: string;
    fromAccountType: string;
    toAccountType: string;
    amount: string;
    note?: string;
  }): Observable<GrpcSuccessResponse>;
}

@Injectable()
export class WalletGrpcService implements OnModuleInit {
  private readonly logger = new Logger(WalletGrpcService.name);
  private financialService!: FinancialService;
  private readonly TIMEOUT_MS = 5000;

  constructor(
    @Inject('FINANCIAL_PACKAGE') private client: ClientGrpc,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  onModuleInit() {
    this.financialService =
      this.client.getService<FinancialService>('FinancialService');
  }

  async getBalance(userId: string, accountType: string = 'MAIN') {
    return this.circuitBreaker.execute(
      'wallet.getBalance',
      async () => {
        const response: unknown = await firstValueFrom(
          this.financialService.getBalance({ userId, accountType }).pipe(
            timeout(this.TIMEOUT_MS),
            catchError((err) => { throw err; }),
          ),
        );
        return response;
      },
      { fallbackResponse: { balance: '0', currency: 'TRY' } },
    );
  }

  async getWallet(userId: string) {
    this.logger.log(`getWallet called for userId=${userId}`);
    const result = await this.circuitBreaker.execute(
      'wallet.getWallet',
      async () => {
        const response = await firstValueFrom(this.financialService.getWallet({ userId }));
        this.logger.log(`gRPC getWallet response: ${JSON.stringify(response)}`);
        return response;
      },
      { fallbackResponse: { accounts: [], requests: [], withdrawalRequests: [], giftCards: [] } },
    );
    this.logger.log(`getWallet final result: ${JSON.stringify(result)}`);
    return result;
  }

  async getTransactions(
    userId: string,
    accountType?: string,
    page: number = 1,
    limit: number = 20,
    accountId?: string,
  ) {
    return this.circuitBreaker.execute(
      'wallet.getTransactions',
      async () => firstValueFrom(
        this.financialService.getTransactions({
          userId,
          accountType: accountType || '',
          page,
          limit,
          accountId: accountId || '',
        }),
      ),
      { fallbackResponse: { transactions: [], total: 0 } },
    );
  }

  async topUpWallet(
    userId: string,
    amount: string,
    paymentMethod: string,
    idempotencyKey: string,
  ) {
    return this.circuitBreaker.execute(
      'wallet.topUpWallet',
      async () => {
        const response: GrpcSuccessResponse = await firstValueFrom(
          this.financialService.topUpWallet({ userId, amount, paymentMethod, idempotencyKey }).pipe(
            timeout(this.TIMEOUT_MS),
            catchError((err) => { throw err; }),
          ),
        );
        if (!response.success) {
          throw new DomainException(response.error || 'TopUp failed');
        }
        return response;
      },
      { fallbackResponse: { success: false, error: 'Servis şu anda erişilemez' } },
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
    return this.circuitBreaker.execute(
      'wallet.requestWithdrawal',
      async () => {
        const response: GrpcSuccessResponse = await firstValueFrom(
          this.financialService.requestWithdrawal(data).pipe(
            timeout(this.TIMEOUT_MS),
            catchError((err) => { throw err; }),
          ),
        );
        if (!response.success) {
          throw new DomainException(response.error || 'Withdrawal failed');
        }
        return response;
      },
      { fallbackResponse: { success: false, error: 'Servis şu anda erişilemez' } },
    );
  }

  async getWithdrawals(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    return this.circuitBreaker.execute(
      'wallet.getWithdrawals',
      async () => firstValueFrom(
        this.financialService.getWithdrawals({ userId: userId || '', status: status || '', page, limit }),
      ),
      { fallbackResponse: { items: [], total: 0 } },
    );
  }

  async getWalletRequests(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    return this.circuitBreaker.execute(
      'wallet.getWalletRequests',
      async () => firstValueFrom(
        this.financialService.getWalletRequests({ userId: userId || '', status: status || '', page, limit }),
      ),
      { fallbackResponse: { items: [], total: 0 } },
    );
  }

  async processWalletRequest(data: {
    requestId: string;
    action: string;
    adminId: string;
    reason?: string;
  }) {
    return this.circuitBreaker.execute(
      'wallet.processWalletRequest',
      async () => {
        const response: GrpcSuccessResponse = await firstValueFrom(
          this.financialService.processWalletRequest(data),
        );
        if (!response.success) {
          throw new DomainException(response.error || 'Request processing failed');
        }
        return response;
      },
    );
  }

  async processWithdrawal(data: {
    withdrawalId: string;
    action: string;
    adminId: string;
    reason?: string;
  }) {
    return this.circuitBreaker.execute(
      'wallet.processWithdrawal',
      async () => {
        const response: GrpcSuccessResponse = await firstValueFrom(
          this.financialService.processWithdrawal(data),
        );
        if (!response.success) {
          throw new DomainException(response.error || 'Withdrawal processing failed');
        }
        return response;
      },
    );
  }

  async createGiftCard(data: {
    code: string;
    amount: string;
    expiresAt?: string;
    customerId?: string;
    note?: string;
  }) {
    return this.circuitBreaker.execute(
      'wallet.createGiftCard',
      async () => {
        const response: GrpcSuccessResponse = await firstValueFrom(
          this.financialService.createGiftCard(data),
        );
        if (!response.success) {
          throw new DomainException(response.error || 'Gift card creation failed');
        }
        return response;
      },
    );
  }

  async listGiftCards(data: { customerId: string; page?: number; limit?: number }) {
    if (!data.customerId) throw new Error('customerId zorunludur');
    return this.circuitBreaker.execute(
      'wallet.listGiftCards',
      async () => firstValueFrom(this.financialService.listGiftCards(data)),
      { fallbackResponse: { items: [], total: 0 } },
    );
  }

  async getGiftCard(id: string) {
    return this.circuitBreaker.execute(
      'wallet.getGiftCard',
      async () => firstValueFrom(this.financialService.getGiftCard({ id })),
      { fallbackResponse: null },
    );
  }
  async transferBetweenAccounts(data: {
    userId: string;
    fromAccountType: string;
    toAccountType: string;
    amount: string;
    note?: string;
  }) {
    return this.circuitBreaker.execute(
      'wallet.transferBetweenAccounts',
      async () => {
        const response: GrpcSuccessResponse = await firstValueFrom(
          this.financialService.transferBetweenAccounts(data).pipe(
            timeout(this.TIMEOUT_MS),
            catchError((err) => { throw err; }),
          ),
        );
        if (!response.success) {
          throw new DomainException(response.error || 'Transfer failed');
        }
        return response;
      },
      { fallbackResponse: { success: false, error: 'Servis şu an kullanılamıyor' } },
    );
  }
}
