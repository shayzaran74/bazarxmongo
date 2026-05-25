// apps/backend/src/modules/communication/application/commands/create-notification.command.ts

import { Command } from '@barterborsa/shared-core';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationMetadata } from '../../domain/entities/notification.entity';

export class CreateNotificationCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly link?: string,
    public readonly metadata?: NotificationMetadata
  ) {
    super();
  }
}
