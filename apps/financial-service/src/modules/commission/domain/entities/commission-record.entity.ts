// apps/financial-service/src/modules/commission/domain/entities/commission-record.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Decimal } from 'decimal.js';

interface CommissionRecordProps {
  orderId?: string;
  tradeOfferId?: string;
  vendorId: string;
  vendorTier: string;
  baseAmount: Decimal;
  commissionRate: Decimal;
  commissionAmount: Decimal;
  commissionType: 'CASH' | 'BARTER';
  status: 'CALCULATED' | 'COLLECTED' | 'FAILED';
  createdAt: Date;
  collectedAt?: Date;
}

export class CommissionRecord extends AggregateRoot<CommissionRecordProps> {
  constructor(props: CommissionRecordProps, id?: string) {
    super(props, id);
  }

  get orderId(): string | undefined { return this.props.orderId; }
  get tradeOfferId(): string | undefined { return this.props.tradeOfferId; }
  get vendorId(): string { return this.props.vendorId; }
  get vendorTier(): string { return this.props.vendorTier; }
  get baseAmount(): Decimal { return this.props.baseAmount; }
  get commissionRate(): Decimal { return this.props.commissionRate; }
  get commissionAmount(): Decimal { return this.props.commissionAmount; }
  get commissionType(): string { return this.props.commissionType; }
  get status(): string { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }
  get collectedAt(): Date | undefined { return this.props.collectedAt; }

  static create(props: Omit<CommissionRecordProps, 'createdAt' | 'status'>): CommissionRecord {
    return new CommissionRecord({
      ...props,
      status: 'CALCULATED',
      createdAt: new Date(),
    });
  }

  markAsCollected(): void {
    this.props.status = 'COLLECTED';
    this.props.collectedAt = new Date();
  }
}
