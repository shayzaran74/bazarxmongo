// apps/backend/src/modules/communication/domain/entities/notification.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface NotificationProps {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export class Notification extends AggregateRoot<NotificationProps> {
  private constructor(props: NotificationProps, id?: string) {
    super(props, id);
  }

  public static create(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, unknown>
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
