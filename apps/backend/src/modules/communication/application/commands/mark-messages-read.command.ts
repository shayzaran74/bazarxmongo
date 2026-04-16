// apps/backend/src/modules/communication/application/commands/mark-messages-read.command.ts

import { Command } from '@barterborsa/shared-core';

export class MarkMessagesReadCommand extends Command {
  constructor(
    public readonly roomId: string,
    public readonly userId: string
  ) {
    super();
  }
}
