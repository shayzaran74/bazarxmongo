// apps/backend/src/modules/loyalty/infrastructure/persistence/mappers/loyalty.mappers.ts

import { UserLevel, UserLevelProps } from '../../../domain/entities/user-level.entity';
import { XpBatch, XpBatchProps } from '../../../domain/entities/loyalty-misc.entities';

interface UserLevelRaw {
  id: string;
  userId: string;
  currentXp: number;
  lifetimeXp: number;
  level: number;
  tierId?: string;
  lastLoginBonusAt?: Date;
  isFirstOrder: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface XpBatchRaw {
  id: string;
  accountId: string;
  originalAmount: number;
  currentBalance: number;
  sourceType: string;
  sourceRefId?: string;
  createdAt: Date;
  expiresAt: Date;
  isBurned: boolean;
}

export class LoyaltyMappers {
  static userLevelToDomain(raw: UserLevelRaw): UserLevel {
    const props: UserLevelProps = {
      userId:           raw.userId,
      currentXp:        Number(raw.currentXp),
      lifetimeXp:       Number(raw.lifetimeXp),
      level:            Number(raw.level),
      tierId:           raw.tierId,
      lastLoginBonusAt: raw.lastLoginBonusAt,
      isFirstOrder:     raw.isFirstOrder,
      createdAt:        raw.createdAt,
      updatedAt:        raw.updatedAt,
    };
    return UserLevel.fromPersistence(props, raw.id);
  }

  static userLevelToPersistence(domain: UserLevel): Record<string, unknown> {
    const props = domain.getProps();
    return {
      ...props,
      id: domain.id.toString(),
    };
  }

  static xpBatchToDomain(raw: XpBatchRaw): XpBatch {
    const props: XpBatchProps = {
      accountId:      raw.accountId,
      originalAmount: Number(raw.originalAmount),
      currentBalance: Number(raw.currentBalance),
      sourceType:     raw.sourceType,
      sourceRefId:    raw.sourceRefId,
      createdAt:      raw.createdAt,
      expiresAt:      raw.expiresAt,
      isBurned:       raw.isBurned,
    };
    return XpBatch.fromPersistence(props, raw.id);
  }

  static xpBatchToPersistence(domain: XpBatch): Record<string, unknown> {
    const props = domain.getProps();
    return {
      ...props,
      id:             domain.id.toString(),
      originalAmount: props.originalAmount,
      currentBalance: props.currentBalance,
    };
  }
}
