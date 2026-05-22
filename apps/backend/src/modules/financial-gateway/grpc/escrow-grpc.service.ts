// apps/backend/src/modules/financial-gateway/grpc/escrow-grpc.service.ts

import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { DomainException } from '@barterborsa/shared-core';
import { CircuitBreakerService } from '../../../common/resilience/circuit-breaker.service';

export interface EscrowResponse {
  success: boolean;
  error?: string;
  holdId?: string;
}

interface HoldFundsRequest {
  userId: string;
  amount: string;
  reason: string;
  referenceId: string;
  referenceType: string;
  idempotencyKey: string;
  sellerId: string;
}

interface FundsActionRequest {
  holdId: string;
  idempotencyKey: string;
}

interface FinancialService {
  holdFunds(data: HoldFundsRequest): Observable<EscrowResponse>;
  releaseFunds(data: FundsActionRequest): Observable<EscrowResponse>;
  refundFunds(data: FundsActionRequest): Observable<EscrowResponse>;
}

@Injectable()
export class EscrowGrpcService implements OnModuleInit {
  private financialService!: FinancialService;
  private readonly TIMEOUT_MS = 5000;

  constructor(
    @Inject('FINANCIAL_PACKAGE') private client: ClientGrpc,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  onModuleInit() {
    this.financialService = this.client.getService<FinancialService>('FinancialService');
  }

  async holdFunds(
    userId: string,
    amount: string,
    reason: string,
    referenceId: string,
    referenceType: string,
    idempotencyKey: string,
    sellerId: string = '',
  ) {
    return this.circuitBreaker.execute(
      'escrow.holdFunds',
      async () => {
        const response: EscrowResponse = await firstValueFrom(
          this.financialService.holdFunds({
            userId, amount, reason, referenceId, referenceType, idempotencyKey, sellerId,
          }),
        );
        if (!response.success) {
          throw new DomainException(response.error || 'Hold funds failed');
        }
        return response;
      },
      { fallbackResponse: { success: false, error: 'Servis şu anda erişilemez' } },
    );
  }

  async releaseFunds(holdId: string, idempotencyKey: string) {
    return this.circuitBreaker.execute(
      'escrow.releaseFunds',
      async () => {
        const response: EscrowResponse = await firstValueFrom(
          this.financialService.releaseFunds({ holdId, idempotencyKey }),
        );
        return response;
      },
      { fallbackResponse: { success: false, error: 'Servis şu anda erişilemez' } },
    );
  }

  async refundFunds(holdId: string, idempotencyKey: string) {
    return this.circuitBreaker.execute(
      'escrow.refundFunds',
      async () => {
        const response: EscrowResponse = await firstValueFrom(
          this.financialService.refundFunds({ holdId, idempotencyKey }),
        );
        return response;
      },
      { fallbackResponse: { success: false, error: 'Servis şu anda erişilemez' } },
    );
  }
}
