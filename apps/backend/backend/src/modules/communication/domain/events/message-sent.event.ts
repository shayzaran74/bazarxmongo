// apps/backend/src/modules/communication/domain/events/message-sent.event.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class MessageSentEvent extends DomainEvent {
  public readonly eventName = 'message.sent';

  constructor(
    public readonly messageId: string,
    public readonly roomId: string,
    public readonly senderId: string | null,
    public readonly content: string
  ) {
    super(roomId);
  }
}
