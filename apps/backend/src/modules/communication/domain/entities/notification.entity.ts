// apps/backend/src/modules/communication/domain/entities/notification.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { NotificationType } from '../enums/notification-type.enum';

export type NotificationMetadata =
  | { type: 'ORDER_STATUS'; orderId: string; previousStatus?: string; newStatus?: string }
  | { type: 'BARTER_OFFER'; offerId: string; fromVendorId: string }
  | { type: 'AUCTION_BID'; auctionId: string; newBidAmount: string }
  | { type: 'CAMPAIGN'; campaignId: string }
  | { type: 'CHAT_MESSAGE'; roomId: string; senderName: string }
  | { type: 'MENU_EXPIRY_WARNING'; menuPurchaseId: string; expiresAt: string; daysRemaining: number }
  | { type: 'MENU_TRANSFER_RECEIVED'; menuPurchaseId: string }
  | { type: 'RESERVATION_CONFIRMED'; reservationId: string }
  | { type: 'RESERVATION_CANCELLED'; reservationId: string; reason?: string }
  | { type: 'SURPRISE_MENU_NEARBY'; restaurantId: string; distanceMeters: number }
  | { type: 'NEW_RESTAURANT_NEARBY'; restaurantId: string; distanceMeters: number }
  | { type: 'SYSTEM'; message: string };

export interface NotificationProps {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata?: NotificationMetadata;
  createdAt: Date;
}

export class Notification extends AggregateRoot<NotificationProps> {
  private constructor(props: NotificationProps, id?: string) {
    super(props, id);
  }

  public static create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: NotificationMetadata
  ): Notification {
    return new Notification({
      userId,
      type,
      title,
      message,
      link,
      isRead: false,
      metadata,
      createdAt: new Date(),
    });
  }

  public markAsRead(): void {
    this.props.isRead = true;
  }

  public static createFrom(props: NotificationProps, id: string): Notification {
    return new Notification(props, id);
  }
}
