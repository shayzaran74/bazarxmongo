// apps/financial-service/src/modules/wallet/application/queries/get-balance.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { GetBalanceQuery } from './get-balance.query';
import { IWalletRepository } from '../../domain/repositories/wallet.repository.interface';

interface BalanceResult {
  balance: Decimal;
  availableBalance: Decimal;
  blockedBalance: Decimal;
}

@QueryHandler(GetBalanceQuery)
export class GetBalanceHandler implements IQueryHandler<GetBalanceQuery> {
  constructor(
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(query: GetBalanceQuery): Promise<BalanceResult> {
    const wallet = await this.walletRepository.findByUserId(query.userId);

    // Henüz oluşturulmamış cüzdan → sıfır bakiye (kayıt yan etkisi yok)
    if (!wallet) {
      const zero = new Decimal(0);
      return { balance: zero, availableBalance: zero, blockedBalance: zero };
    }

    return {
      balance: wallet.balanceTL.amount,
      availableBalance: wallet.balanceTL.amount,
      blockedBalance: new Decimal(0),
    };
  }
}
