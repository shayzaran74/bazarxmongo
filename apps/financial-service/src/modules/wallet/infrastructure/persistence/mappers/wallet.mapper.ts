// apps/financial-service/src/modules/wallet/infrastructure/persistence/mappers/wallet.mapper.ts

import { Injectable } from '@nestjs/common';
import { Wallet as PrismaWallet } from '../../../../../generated/client';
import { Wallet } from '../../../domain/entities/wallet.entity';
import { Money } from '../../../domain/value-objects/money.vo';

@Injectable()
export class WalletMapper {
  toDomain(raw: PrismaWallet): Wallet {
    return new Wallet({
      userId: raw.userId,
      balanceTL: Money.fromDecimal(raw.balanceTL, 'TRY'),
      barterBalance: Money.fromDecimal(raw.barterBalance, 'BARTER'),
      xpPoints: raw.xpPoints,
      xpAdsBalance: Money.fromDecimal(raw.xpAdsBalance, 'TRY'),
      xpTradeBalance: Money.fromDecimal(raw.xpTradeBalance, 'TRY'),
      xpCommissionBalance: Money.fromDecimal(raw.xpCommissionBalance, 'TRY'),
    }, raw.id);
  }

  toPersistence(entity: Wallet) {
    return {
      userId: entity.userId,
      balanceTL: entity.balanceTL.amount,
      barterBalance: entity.barterBalance.amount,
      xpPoints: entity.xpPoints,
      xpAdsBalance: entity.xpAdsBalance.amount,
      xpTradeBalance: entity.xpTradeBalance.amount,
      xpCommissionBalance: entity.xpCommissionBalance.amount,
    };
  }
}
