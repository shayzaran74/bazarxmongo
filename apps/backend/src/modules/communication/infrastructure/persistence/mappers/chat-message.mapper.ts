// apps/backend/src/modules/communication/infrastructure/persistence/mappers/chat-message.mapper.ts

import { Injectable } from '@nestjs/common';
import { ChatMessage } from '../../../domain/entities/chat-message.entity';
import { ChatMessageType } from '../../../domain/enums/chat-message-type.enum';

@Injectable()
export class ChatMessageMapper {
  toDomain(raw: any): ChatMessage {
    return (ChatMessage as any).createFrom({
      ...raw,
      type: raw.type as ChatMessageType,
      metadata: raw.metadata || undefined,
    }, raw.id);
  }

  toPersistence(domain: ChatMessage): any {
    const props = domain.getProps();
    return {
      id: domain.id,
      roomId: props.roomId,
      senderId: props.senderId,
      content: props.content,
      type: props.type,
      isRead: props.isRead,
      readAt: props.readAt,
      readById: props.readById,
      metadata: props.metadata,
      createdAt: props.createdAt,
    };
  }
}
