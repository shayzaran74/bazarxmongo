// apps/backend/src/modules/communication/domain/entities/chat-room.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { ChatRoomStatus } from '../enums/chat-room-status.enum';

export interface ChatRoomProps {
  orderId?: string;
  tradeOfferId?: string;
  status: ChatRoomStatus;
  participantIds: string[];
  isArchived: boolean;
  archivedAt?: Date;
  storageTier: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChatRoom extends AggregateRoot<ChatRoomProps> {
  private constructor(props: ChatRoomProps, id?: string) {
    super(props, id);
  }

  public static createForOrder(orderId: string, buyerId: string, vendorId: string): ChatRoom {
    const now = new Date();
    return new ChatRoom({
      orderId,
      status: ChatRoomStatus.ACTIVE,
      participantIds: [buyerId, vendorId],
      isArchived: false,
      storageTier: 'STANDARD',
      createdAt: now,
      updatedAt: now,
    });
  }

  public static createForTrade(tradeOfferId: string, initiatorId: string, receiverId: string): ChatRoom {
    const now = new Date();
    return new ChatRoom({
      tradeOfferId,
      status: ChatRoomStatus.ACTIVE,
      participantIds: [initiatorId, receiverId],
      isArchived: false,
      storageTier: 'STANDARD',
      createdAt: now,
      updatedAt: now,
    });
  }

  public archive(): void {
    this.props.isArchived = true;
    this.props.archivedAt = new Date();
    this.props.status = ChatRoomStatus.ARCHIVED;
    this.props.updatedAt = new Date();
  }

  public close(): void {
    this.props.status = ChatRoomStatus.CLOSED;
    this.props.updatedAt = new Date();
  }

  public isParticipant(userId: string): boolean {
    return this.props.participantIds.includes(userId);
  }

  public static createFrom(props: ChatRoomProps, id: string): ChatRoom {
    return new ChatRoom(props, id);
  }
}
