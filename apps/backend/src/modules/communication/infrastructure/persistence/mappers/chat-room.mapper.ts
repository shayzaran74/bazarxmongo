// apps/backend/src/modules/communication/infrastructure/persistence/mappers/chat-room.mapper.ts

import { Injectable } from '@nestjs/common';
import { ChatRoom } from '../../../domain/entities/chat-room.entity';
import { ChatRoomStatus } from '../../../domain/enums/chat-room-status.enum';

@Injectable()
export class ChatRoomMapper {
  toDomain(raw: any): ChatRoom {
    return (ChatRoom as any).createFrom({
      ...raw,
      status: raw.status as ChatRoomStatus,
      archivePreview: raw.archivePreview || undefined,
    }, raw.id);
  }

  toPersistence(domain: ChatRoom): any {
    const props = domain.getProps();
    return {
      id: domain.id,
      orderId: props.orderId,
      tradeOfferId: props.tradeOfferId,
      status: props.status,
      participantIds: props.participantIds,
      isArchived: props.isArchived,
      archivedAt: props.archivedAt,
      storageTier: props.storageTier,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
