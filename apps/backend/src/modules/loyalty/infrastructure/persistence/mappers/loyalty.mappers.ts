// apps/backend/src/modules/loyalty/infrastructure/persistence/mappers/loyalty.mappers.ts

import { UserLevel } from '../../../domain/entities/user-level.entity';
import { XpBatch } from '../../../domain/entities/loyalty-misc.entities';

export class LoyaltyMappers {
  static userLevelToDomain(raw: any): UserLevel {
    return (UserLevel as any).create({
      ...raw,
    }, raw.id);
  }

  static userLevelToPersistence(domain: UserLevel): any {
    const props = domain.getProps();
    return {
      ...props,
      id: domain.id.toString(),
    };
  }

  static xpBatchToDomain(raw: any): XpBatch {
    return (XpBatch as any).create({
      ...raw,
      originalAmount: Number(raw.originalAmount),
      currentBalance: Number(raw.currentBalance),
    }, raw.id);
  }

  static xpBatchToPersistence(domain: XpBatch): any {
    const props = domain.getProps();
    return {
      ...props,
      id: domain.id.toString(),
      originalAmount: props.originalAmount,
      currentBalance: props.currentBalance,
    };
  }
}
