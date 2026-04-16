// apps/backend/src/modules/barter/domain/entities/swap-session.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Prisma } from '@prisma/client';
import { SwapSessionStatus } from '../enums/swap-session-status.enum';
import { BarterPart } from './barter-part.entity';

export interface SwapSessionProps {
  tradeOfferId: string;
  initiatorId: string;
  receiverId: string;
  shipmentMode: string;
  shipments?: any;
  escrowId?: string;
  collateralAmount: Prisma.Decimal;
  collateralCurrency: string;
  collateralStatus: string;
  collateralLockedAt?: Date;
  collateralReleasedAt?: Date;
  status: SwapSessionStatus;
  fromCollateralHoldId?: string;
  toCollateralHoldId?: string;
  timeoutAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  disputedAt?: Date;
  parts: BarterPart[];
  createdAt: Date;
  updatedAt: Date;
}

export class SwapSession extends AggregateRoot<SwapSessionProps> {
  private constructor(props: SwapSessionProps, id?: string) {
    super(props, id);
  }

  public static create(
    tradeOfferId: string,
    initiatorId: string,
    receiverId: string,
    collateralAmount: Prisma.Decimal,
    timeoutInDays: number = 30
  ): SwapSession {
    const now = new Date();
    const timeoutAt = new Date();
    timeoutAt.setDate(now.getDate() + timeoutInDays);

    return new SwapSession({
      tradeOfferId,
      initiatorId,
      receiverId,
      shipmentMode: 'CARRIER',
      collateralAmount,
      collateralCurrency: 'TRY',
      collateralStatus: 'PENDING',
      status: SwapSessionStatus.PENDING_COLLATERAL,
      timeoutAt,
      parts: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  public activate(): void {
    this.props.status = SwapSessionStatus.ACTIVE;
    this.props.collateralLockedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public complete(): void {
    this.props.status = SwapSessionStatus.COMPLETED;
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public dispute(): void {
    this.props.status = SwapSessionStatus.DISPUTED;
    this.props.disputedAt = new Date();
    this.props.updatedAt = new Date();
  }
}
