// apps/backend/src/modules/communication/domain/events/notification-created.event.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class NotificationCreatedEvent extends DomainEvent {
  public readonly eventName = 'notification.created';

  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly type: string
  ) {
    super(userId);
  }
}
