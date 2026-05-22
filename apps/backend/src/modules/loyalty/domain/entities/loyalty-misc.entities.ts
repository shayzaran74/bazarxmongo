// apps/backend/src/modules/loyalty/domain/entities/loyalty-misc.entities.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { XpSourceType } from '../enums/loyalty.enums';

export interface XpTransactionProps {
  userId: string;
  amount: number;
  type: string;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export class XpTransaction extends AggregateRoot<XpTransactionProps> {
  private constructor(props: XpTransactionProps, id?: string) { super(props, id); }
  public static create(props: Omit<XpTransactionProps, 'createdAt'>, id?: string): XpTransaction {
    return new XpTransaction({ ...props, createdAt: new Date() }, id);
  }
}

export interface XpBatchProps {
  accountId: string;
  originalAmount: number;
  currentBalance: number;
  sourceType: string;
  sourceRefId?: string;
  createdAt: Date;
  expiresAt: Date;
  isBurned: boolean;
}

export class XpBatch extends AggregateRoot<XpBatchProps> {
  private constructor(props: XpBatchProps, id?: string) { super(props, id); }
  public static create(props: Omit<XpBatchProps, 'createdAt' | 'isBurned' | 'currentBalance'>, id?: string): XpBatch {
    return new XpBatch({
      ...props,
      currentBalance: props.originalAmount,
      isBurned: false,
      createdAt: new Date()
    }, id);
  }

  public static fromPersistence(props: XpBatchProps, id: string): XpBatch {
    return new XpBatch(props, id);
  }

  public deduct(amount: number): void {
    if (this.props.currentBalance < amount) throw new Error('Batch insufficient balance');
    this.props.currentBalance -= amount;
  }

  public burn(): void {
    this.props.isBurned = true;
    this.props.currentBalance = 0;
  }

  public isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }
}

export interface LoyaltyTierHistoryProps {
  userId: string;
  fromTier?: string;
  toTier: string;
  reason?: string;
  triggeredBy?: string;
  createdAt: Date;
}

export class LoyaltyTierHistory extends AggregateRoot<LoyaltyTierHistoryProps> {
  private constructor(props: LoyaltyTierHistoryProps, id?: string) { super(props, id); }
  public static create(props: Omit<LoyaltyTierHistoryProps, 'createdAt'>, id?: string): LoyaltyTierHistory {
    return new LoyaltyTierHistory({ ...props, createdAt: new Date() }, id);
  }
}
