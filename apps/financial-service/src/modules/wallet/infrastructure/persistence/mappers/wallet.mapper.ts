// apps/financial-service/src/modules/wallet/infrastructure/persistence/mappers/wallet.mapper.ts

import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Decimal } from 'decimal.js';
import { IWallet } from '@barterborsa/shared-persistence';
import { Wallet } from '../../../domain/entities/wallet.entity';
import { Money } from '../../../domain/value-objects/money.vo';

const fromD128 = (v: Types.Decimal128): Decimal => new Decimal(v.toString());
const toD128 = (v: Decimal): Types.Decimal128 =>
  Types.Decimal128.fromString(v.toFixed(2));

@Injectable()
export class WalletMapper {
  toDomain(raw: IWallet): Wallet {
    return new Wallet(
      {
        userId: raw.userId,
        balanceTL:           Money.fromDecimal(fromD128(raw.balanceTL), 'TRY'),
        barterBalance:       Money.fromDecimal(fromD128(raw.barterBalance), 'BARTER'),
        xpPoints:            raw.xpPoints,
        xpAdsBalance:        Money.fromDecimal(fromD128(raw.xpAdsBalance), 'TRY'),
        xpTradeBalance:      Money.fromDecimal(fromD128(raw.xpTradeBalance), 'TRY'),
        xpCommissionBalance: Money.fromDecimal(fromD128(raw.xpCommissionBalance), 'TRY'),
        lastXpAdsEarnedDate: raw.lastXpAdsEarnedDate,
      },
      raw.id,
    );
  }

  toPersistence(entity: Wallet): Partial<IWallet> {
    return {
      userId:              entity.userId,
      balanceTL:           toD128(entity.balanceTL.amount),
      barterBalance:       toD128(entity.barterBalance.amount),
      xpPoints:            entity.xpPoints,
      xpAdsBalance:        toD128(entity.xpAdsBalance.amount),
      xpTradeBalance:      toD128(entity.xpTradeBalance.amount),
      xpCommissionBalance: toD128(entity.xpCommissionBalance.amount),
      lastXpAdsEarnedDate: entity.lastXpAdsEarnedDate ?? undefined,
    };
  }
}
