// apps/backend/src/modules/communication/infrastructure/persistence/mappers/chat-room.mapper.ts
// ChatRoomMapper — Prisma → Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { IChatRoom, StorageTierType } from '@barterborsa/shared-persistence/schemas/backend/chatRoom.schema';
import { ChatRoom } from '../../../domain/entities/chat-room.entity';

export interface ChatRoomDocument extends IChatRoom {
  _id?: string;
  status?: string;
}

@Injectable()
export class ChatRoomMapper {
  static toDomain(doc: ChatRoomDocument): ChatRoom {
    return ChatRoom.createFrom({
      orderId: doc.orderId ?? undefined,
      tradeOfferId: doc.tradeOfferId ?? undefined,
      status: (doc as any).status ?? 'ACTIVE',
      participantIds: doc.participantIds ?? [],
      isArchived: doc.isArchived ?? false,
      archivedAt: doc.archivedAt ?? undefined,
      storageTier: (doc.storageTier as StorageTierType) ?? 'STANDARD',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }, doc.id);
  }

  static toPersistence(domain: ChatRoom): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      orderId: props.orderId,
      tradeOfferId: props.tradeOfferId,
      participantIds: props.participantIds,
      isArchived: props.isArchived,
      archivedAt: props.archivedAt,
      storageTier: props.storageTier,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}