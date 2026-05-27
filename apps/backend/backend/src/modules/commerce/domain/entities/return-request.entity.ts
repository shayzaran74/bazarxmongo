// apps/backend/src/modules/commerce/domain/entities/return-request.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { ReturnStatus } from '../enums/return-status.enum';
import { ReturnReasonType } from '../enums/return-reason-type.enum';

export interface ReturnItemProps {
  id: string;
  orderItemId: string;
  quantity: number;
  refundAmount: number;
  reason?: string;
}

export interface ReturnRequestProps {
  orderId: string;
  userId: string;
  status: ReturnStatus;
  reason: string;
  reasonType: ReturnReasonType;
  items: ReturnItemProps[];
  totalRefund: number;
  sellerId: string;
  sellerDeadlineAt: Date;
  autoApproveAt: Date;
  sellerRespondedAt?: Date;
  adminArbitration: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VALID_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  [ReturnStatus.PENDING]:      [ReturnStatus.APPROVED, ReturnStatus.REJECTED, ReturnStatus.AUTO_APPROVED, ReturnStatus.CANCELLED],
  [ReturnStatus.APPROVED]:     [],
  [ReturnStatus.REJECTED]:     [],
  [ReturnStatus.AUTO_APPROVED]: [],
  [ReturnStatus.CANCELLED]:     [],
};

export class ReturnRequest extends AggregateRoot<ReturnRequestProps> {
  private constructor(props: ReturnRequestProps, id?: string) {
    super(props, id);
  }

  public static create(props: {
    orderId: string;
    userId: string;
    reason: string;
    reasonType: ReturnReasonType;
    items: ReturnItemProps[];
    totalRefund: number;
    sellerId: string;
  }): ReturnRequest {
    const now = new Date();
    const sellerDeadline = new Date(now);
    sellerDeadline.setHours(sellerDeadline.getHours() + 48);
    const autoApprove = new Date(sellerDeadline);
    autoApprove.setHours(autoApprove.getHours() + 48); // 48s sonra auto-approve

    return new ReturnRequest({
      orderId: props.orderId,
      userId: props.userId,
      status: ReturnStatus.PENDING,
      reason: props.reason,
      reasonType: props.reasonType,
      items: props.items,
      totalRefund: props.totalRefund,
      sellerId: props.sellerId,
      sellerDeadlineAt: sellerDeadline,
      autoApproveAt: autoApprove,
      adminArbitration: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromPersistence(props: ReturnRequestProps, id: string): ReturnRequest {
    return new ReturnRequest(props, id);
  }

  public transitionTo(newStatus: ReturnStatus): void {
    const current = this.props.status;
    const allowed = VALID_TRANSITIONS[current] || [];
    if (!allowed.includes(newStatus)) {
      throw new DomainException(`Invalid state transition: ${current} → ${newStatus}`);
    }
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  public approve(): void {
    this.transitionTo(ReturnStatus.APPROVED);
    this.props.sellerRespondedAt = new Date();
  }

  public reject(): void {
    this.transitionTo(ReturnStatus.REJECTED);
    this.props.sellerRespondedAt = new Date();
  }

  public autoApprove(): void {
    this.transitionTo(ReturnStatus.AUTO_APPROVED);
  }

  public cancel(): void {
    this.transitionTo(ReturnStatus.CANCELLED);
  }

  public escalateToAdmin(): void {
    this.props.adminArbitration = true;
    this.props.updatedAt = new Date();
  }

  get orderId(): string { return this.props.orderId; }
  get userId(): string { return this.props.userId; }
  get status(): ReturnStatus { return this.props.status; }
  get totalRefund(): number { return this.props.totalRefund; }
  get sellerId(): string { return this.props.sellerId; }
  get sellerDeadlineAt(): Date { return this.props.sellerDeadlineAt; }
  get autoApproveAt(): Date { return this.props.autoApproveAt; }
}