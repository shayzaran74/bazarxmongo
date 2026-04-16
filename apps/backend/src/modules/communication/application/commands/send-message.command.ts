// apps/backend/src/modules/communication/application/commands/send-message.command.ts

import { Command } from '@barterborsa/shared-core';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';

export class SendMessageCommand extends Command {
  constructor(
    public readonly roomId: string,
    public readonly senderId: string | null,
    public readonly content: string,
    public readonly type: ChatMessageType = ChatMessageType.TEXT
  ) {
    super();
  }
}
