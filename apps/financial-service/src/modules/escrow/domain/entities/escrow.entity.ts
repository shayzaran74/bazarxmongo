// apps/financial-service/src/modules/escrow/domain/entities/escrow.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Decimal } from 'decimal.js';

export type EscrowStatus =
  | 'PENDING'
  | 'FUNDED'
  | 'HELD'
  | 'RELEASED'
  | 'REFUNDED'
  | 'DISPUTED'
  | 'CANCELLED';

interface EscrowProps {
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: Decimal;
  releasedAmount: Decimal;
  status: EscrowStatus;
  createdAt: Date;
  updatedAt: Date;
  releasedAt?: Date;
  payoutLog?: Record<string, unknown>;
}

// Prisma tablosundan gelen ham kayıt yapısı (infrastructure tipi domain'e sızmadan)
interface PrismaEscrowRecord {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: Decimal;
  releasedAmount: Decimal;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  releasedAt: Date | null;
  payoutLog: unknown;
}

export class Escrow extends AggregateRoot<EscrowProps> {
  constructor(props: EscrowProps, id?: string) {
    super(props, id);
  }

  get orderId(): string { return this.props.orderId; }
  get buyerId(): string { return this.props.buyerId; }
  get sellerId(): string { return this.props.sellerId; }
  get amount(): Decimal { return this.props.amount; }
  get releasedAmount(): Decimal { return this.props.releasedAmount; }
  get status(): EscrowStatus { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get releasedAt(): Date | undefined { return this.props.releasedAt; }
  get payoutLog(): Record<string, unknown> | undefined { return this.props.payoutLog; }

  fund(): void {
    if (this.props.status !== 'PENDING') throw new Error('Yalnızca PENDING durumdaki kayıtlar fonlanabilir.');
    this.props.status = 'HELD';
    this.props.updatedAt = new Date();
  }

  release(): void {
    if (this.props.status !== 'HELD') {
      throw new Error('Yalnızca HELD durumdaki fonlar çözülebilir.');
    }
    this.props.status = 'RELEASED';
    this.props.releasedAmount = this.props.amount;
    this.props.releasedAt = new Date();
    this.props.updatedAt = new Date();
  }

  refund(): void {
    if (this.props.status !== 'HELD' && this.props.status !== 'DISPUTED') {
      throw new Error('Bu durumda iade yapılamaz.');
    }
    this.props.status = 'REFUNDED';
    this.props.updatedAt = new Date();
  }

  static create(props: Pick<EscrowProps, 'orderId' | 'buyerId' | 'sellerId' | 'amount'>): Escrow {
    return new Escrow({
      ...props,
      releasedAmount: new Decimal(0),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromPersistence(raw: PrismaEscrowRecord): Escrow {
    return new Escrow({
      orderId: raw.orderId,
      buyerId: raw.buyerId,
      sellerId: raw.sellerId,
      amount: new Decimal(raw.amount),
      releasedAmount: new Decimal(raw.releasedAmount || 0),
      status: raw.status as EscrowStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      releasedAt: raw.releasedAt || undefined,
      payoutLog: (raw.payoutLog as Record<string, unknown>) || undefined,
    }, raw.id);
  }
}
