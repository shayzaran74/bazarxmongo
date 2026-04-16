// apps/backend/src/modules/financial-gateway/grpc/wallet-grpc.service.ts

import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { DomainException } from '@barterborsa/shared-core';

interface FinancialService {
  getBalance(data: { userId: string; accountType: string }): any;
}

@Injectable()
export class WalletGrpcService implements OnModuleInit {
  private financialService!: FinancialService;

  constructor(@Inject('FINANCIAL_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.financialService = this.client.getService<FinancialService>('FinancialService');
  }

  async getBalance(userId: string, accountType: string = 'TRY') {
    try {
      const response = await firstValueFrom(
        this.financialService.getBalance({ userId, accountType })
      );
      return response;
    } catch (error: any) {
      throw new DomainException(`Financial Service Error: ${error.message}`);
    }
  }
}
