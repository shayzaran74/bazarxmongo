// apps/backend/src/modules/communication/application/commands/mark-notification-read.command.ts

import { Command } from '@barterborsa/shared-core';

export class MarkNotificationReadCommand extends Command {
  constructor(
    public readonly notificationId: string,
    public readonly userId: string
  ) {
    super();
  }
}
