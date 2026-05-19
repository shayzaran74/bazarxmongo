// apps/backend/src/modules/communication/infrastructure/persistence/mappers/chat-message.mapper.ts
// ChatMessageMapper — Prisma → Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { IChatMessage } from '@barterborsa/shared-persistence/schemas/backend/chatMessage.schema';
import { ChatMessage } from '../../../domain/entities/chat-message.entity';

export interface ChatMessageDocument extends IChatMessage {
  _id?: string;
}

@Injectable()
export class ChatMessageMapper {
  static toDomain(doc: ChatMessageDocument): ChatMessage {
    return (ChatMessage as any).createFrom({
      roomId: doc.roomId,
      senderId: doc.senderId ?? undefined,
      content: doc.content,
      type: (doc.metadata as any)?.type ?? 'TEXT',
      isRead: doc.isRead ?? false,
      readAt: doc.readAt ?? undefined,
      readById: doc.readById ?? undefined,
      metadata: doc.metadata as unknown as Record<string, unknown> | undefined,
      createdAt: doc.createdAt,
    }, doc.id);
  }

  static toPersistence(domain: ChatMessage): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
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