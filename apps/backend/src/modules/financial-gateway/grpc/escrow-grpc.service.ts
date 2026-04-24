// apps/backend/src/modules/financial-gateway/grpc/escrow-grpc.service.ts

import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { DomainException } from '@barterborsa/shared-core';

interface FinancialService {
  holdFunds(data: any): any;
  releaseFunds(data: any): any;
  refundFunds(data: any): any;
}

@Injectable()
export class EscrowGrpcService implements OnModuleInit {
  private financialService!: FinancialService;

  constructor(@Inject('FINANCIAL_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.financialService = this.client.getService<FinancialService>('FinancialService');
  }

  async holdFunds(userId: string, amount: string, reason: string, referenceId: string, referenceType: string, idempotencyKey: string, sellerId: string = '') {
    try {
      const response: any = await firstValueFrom(
        this.financialService.holdFunds({ userId, amount, reason, referenceId, referenceType, idempotencyKey, sellerId })
      );
      if (!response.success) {
        throw new DomainException(response.error || 'Hold funds failed');
      }
      return response;
    } catch (error: any) {
       throw new DomainException(`Escrow Service Error: ${error.message}`);
    }
  }

  async releaseFunds(holdId: string, idempotencyKey: string) {
    try {
      const response = await firstValueFrom(
        this.financialService.releaseFunds({ holdId, idempotencyKey })
      );
      return response;
    } catch (error: any) {
       throw new DomainException(`Escrow Service Error: ${error.message}`);
    }
  }

  async refundFunds(holdId: string, idempotencyKey: string) {
    try {
      const response = await firstValueFrom(
        this.financialService.refundFunds({ holdId, idempotencyKey })
      );
      return response;
    } catch (error: any) {
       throw new DomainException(`Escrow Service Error: ${error.message}`);
    }
  }
}
