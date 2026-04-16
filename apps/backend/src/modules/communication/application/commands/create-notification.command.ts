// apps/backend/src/modules/communication/application/commands/create-notification.command.ts

import { Command } from '@barterborsa/shared-core';

export class CreateNotificationCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly type: string,
    public readonly title: string,
    public readonly message: string,
    public readonly link?: string,
    public readonly metadata?: any
  ) {
    super();
  }
}
