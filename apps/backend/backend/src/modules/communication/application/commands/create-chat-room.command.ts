// apps/backend/src/modules/communication/application/commands/create-chat-room.command.ts

import { Command } from '@barterborsa/shared-core';

export class CreateChatRoomCommand extends Command {
  constructor(
    public readonly orderId?: string,
    public readonly tradeOfferId?: string,
    public readonly participantIds?: string[] // Optional if we know them from order/trade in handler
  ) {
    super();
  }
}
