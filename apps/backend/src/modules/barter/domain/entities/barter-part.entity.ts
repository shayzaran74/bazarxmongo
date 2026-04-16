// apps/backend/src/modules/barter/domain/entities/barter-part.entity.ts

import { Entity } from '@barterborsa/shared-core';
import { BarterPartStatus } from '../enums/barter-part-status.enum';

export interface BarterPartProps {
  swapSessionId: string;
  partNumber: number;
  senderId: string;
  recipientId: string;
  trackingCode?: string;
  carrier?: string;
  status: BarterPartStatus;
  shippedAt?: Date;
  deliveredAt?: Date;
  confirmedAt?: Date;
  disputedAt?: Date;
  disputeWindowEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class BarterPart extends Entity<BarterPartProps> {
  private constructor(props: BarterPartProps, id?: string) {
    super(props, id);
  }

  public static create(
    swapSessionId: string,
    partNumber: number,
    senderId: string,
    recipientId: string
  ): BarterPart {
    const now = new Date();
    return new BarterPart({
      swapSessionId,
      partNumber,
      senderId,
      recipientId,
      status: BarterPartStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  public ship(trackingCode: string, carrier: string): void {
    this.props.trackingCode = trackingCode;
    this.props.carrier = carrier;
    this.props.status = BarterPartStatus.SHIPPED;
    this.props.shippedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public deliver(): void {
    this.props.status = BarterPartStatus.DELIVERED;
    this.props.deliveredAt = new Date();
    
    // Start 3-day dispute window upon delivery
    const windowEnds = new Date();
    windowEnds.setDate(windowEnds.getDate() + 3);
    this.props.disputeWindowEndsAt = windowEnds;
    
    this.props.updatedAt = new Date();
  }

  public confirm(): void {
    this.props.status = BarterPartStatus.CONFIRMED;
    this.props.confirmedAt = new Date();
    this.props.updatedAt = new Date();
  }
}
