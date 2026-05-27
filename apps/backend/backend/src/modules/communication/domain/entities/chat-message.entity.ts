// apps/backend/src/modules/communication/domain/entities/chat-message.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { ChatMessageType } from '../enums/chat-message-type.enum';

export interface ChatMessageProps {
  roomId: string;
  senderId?: string; // null = SYSTEM
  content: string;
  type: ChatMessageType;
  isRead: boolean;
  readAt?: Date;
  readById?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export class ChatMessage extends AggregateRoot<ChatMessageProps> {
  private constructor(props: ChatMessageProps, id?: string) {
    super(props, id);
  }

  public static createText(roomId: string, senderId: string, content: string): ChatMessage {
    return new ChatMessage({
      roomId,
      senderId,
      content,
      type: ChatMessageType.TEXT,
      isRead: false,
      createdAt: new Date(),
    });
  }

  public static createSystem(roomId: string, content: string): ChatMessage {
    return new ChatMessage({
      roomId,
      content,
      type: ChatMessageType.SYSTEM,
      isRead: false,
      createdAt: new Date(),
    });
  }

  public static createImage(roomId: string, senderId: string, imageUrl: string): ChatMessage {
    return new ChatMessage({
      roomId,
      senderId,
      content: imageUrl,
      type: ChatMessageType.IMAGE,
      isRead: false,
      createdAt: new Date(),
    });
  }

  public markAsRead(readById: string): void {
    this.props.isRead = true;
    this.props.readAt = new Date();
    this.props.readById = readById;
  }

  public static createFrom(props: ChatMessageProps, id: string): ChatMessage {
    return new ChatMessage(props, id);
  }
}
