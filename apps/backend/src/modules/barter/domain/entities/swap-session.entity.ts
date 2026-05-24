// apps/backend/src/modules/barter/domain/entities/swap-session.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { SwapSessionStatus } from '../enums/swap-session-status.enum';
import { BarterPart } from './barter-part.entity';

export interface SwapSessionProps {
  tradeOfferId: string;
  initiatorId: string;
  receiverId: string;
  shipmentMode: string;
  shipments?: unknown;
  escrowId?: string;
  collateralAmount: number;
  collateralCurrency: string;
  collateralStatus: string;
  collateralLockedAt?: Date;
  collateralReleasedAt?: Date;
  collateralForfeitedAt?: Date;
  status: SwapSessionStatus;
  fromCollateralHoldId?: string;
  toCollateralHoldId?: string;
  initiatorHoldId?: string;
  receiverHoldId?: string;
  pendingReleaseAt?: Date;
  autoReleasedAt?: Date;
  timeoutAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  disputedAt?: Date;
  parts: BarterPart[];
  createdAt: Date;
  updatedAt: Date;
}

// State geçiş haritası — SwapSessionStatus enum değerlerini kullanır
const VALID_TRANSITIONS: Record<SwapSessionStatus, SwapSessionStatus[]> = {
  [SwapSessionStatus.PENDING_COLLATERAL]: [
    SwapSessionStatus.ACTIVE,
    SwapSessionStatus.CANCELLED,
    SwapSessionStatus.TIMEOUT,
  ],
  [SwapSessionStatus.ACTIVE]: [
    SwapSessionStatus.SHIPPING,
    SwapSessionStatus.DISPUTED,
    SwapSessionStatus.TIMEOUT,
  ],
  [SwapSessionStatus.SHIPPING]: [
    SwapSessionStatus.PARTIALLY_COMPLETED,
    SwapSessionStatus.DISPUTED,
    SwapSessionStatus.COMPLETED,
  ],
  [SwapSessionStatus.PARTIALLY_COMPLETED]: [
    SwapSessionStatus.COMPLETED,
    SwapSessionStatus.DISPUTED,
  ],
  [SwapSessionStatus.COMPLETED]: [],
  [SwapSessionStatus.CANCELLED]: [],
  [SwapSessionStatus.DISPUTED]: [
    SwapSessionStatus.COMPLETED,
    SwapSessionStatus.CANCELLED,
  ],
  [SwapSessionStatus.TIMEOUT]: [],
};

export class SwapSession extends AggregateRoot<SwapSessionProps> {
  private constructor(props: SwapSessionProps, id?: string) {
    super(props, id);
  }

  public static create(
    tradeOfferId: string,
    initiatorId: string,
    receiverId: string,
    collateralAmount: number,
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

  // Persistence'dan yeniden oluşturmak için (domain doğrulaması atlanır)
  public static createFrom(props: SwapSessionProps, id: string): SwapSession {
    return new SwapSession(props, id);
  }

  // Merkezi state geçiş metodu — validasyonlu geçiş
  public transitionTo(newStatus: SwapSessionStatus): void {
    const current = this.props.status;
    const allowed = VALID_TRANSITIONS[current] || [];

    if (!allowed.includes(newStatus)) {
      throw new DomainException(
        `Invalid state transition: ${current} → ${newStatus}`,
      );
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  // Her iki tarafın holdId'sini kaydeder ve collateral durumunu HELD'e geçirir
  public setHoldIds(fromHoldId: string, toHoldId: string): void {
    this.props.fromCollateralHoldId = fromHoldId;
    this.props.toCollateralHoldId = toHoldId;
    this.props.collateralStatus = 'HELD';
    this.props.collateralLockedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.transitionTo(SwapSessionStatus.ACTIVE);
    this.props.collateralLockedAt = new Date();
  }

  public ship(): void {
    this.transitionTo(SwapSessionStatus.SHIPPING);
  }

  public markPartiallyCompleted(): void {
    this.transitionTo(SwapSessionStatus.PARTIALLY_COMPLETED);
  }

  public complete(): void {
    this.transitionTo(SwapSessionStatus.COMPLETED);
    this.props.completedAt = new Date();
  }

  public releaseCollateral(): void {
    // Teminat serbest bırakıldı — COMPLETED veya TIMEOUT durumlarında kullanılır
    this.props.collateralStatus = 'RELEASED';
    this.props.collateralReleasedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public forfeitCollateral(): void {
    // Teminat iade edildi — BUYER_WINS / REFUND_ALL ihtilaf çözümünde kullanılır
    this.props.collateralStatus = 'REFUNDED';
    this.props.collateralForfeitedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public cancel(): void {
    this.transitionTo(SwapSessionStatus.CANCELLED);
    this.props.cancelledAt = new Date();
  }

  public dispute(): void {
    this.transitionTo(SwapSessionStatus.DISPUTED);
    this.props.disputedAt = new Date();
  }

  public markTimeout(): void {
    this.transitionTo(SwapSessionStatus.TIMEOUT);
    this.props.cancelledAt = new Date();
  }
}
