// apps/backend/src/modules/communication/application/queries/get-chat-rooms.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetChatRoomsQuery } from './get-chat-rooms.query';
import { IChatRoomRepository } from '../../domain/repositories/chat-room.repository.interface';
import { IChatMessageRepository } from '../../domain/repositories/chat-message.repository.interface';
import { ChatRoomResponseDto } from '../dtos/chat.dtos';

@QueryHandler(GetChatRoomsQuery)
export class GetChatRoomsHandler implements IQueryHandler<GetChatRoomsQuery> {
  constructor(
    @Inject('IChatRoomRepository') private readonly roomRepo: IChatRoomRepository,
    @Inject('IChatMessageRepository') private readonly messageRepo: IChatMessageRepository,
  ) {}

  async execute(query: GetChatRoomsQuery): Promise<ChatRoomResponseDto[]> {
    const rooms = await this.roomRepo.findByParticipantId(query.userId);

    const result = await Promise.all(
      rooms.map(async (room) => {
        const lastMessages = await this.messageRepo.findByRoomId(room.id, { limit: 1 });
        const unreadCount = await this.messageRepo.countUnread(room.id, query.userId);
        
        const props = room.getProps();
        return {
          id: room.id,
          orderId: props.orderId,
          tradeOfferId: props.tradeOfferId,
          participantIds: props.participantIds,
          status: props.status,
          unreadCount,
          lastMessage: lastMessages[0] ? {
            id: lastMessages[0].id,
            roomId: lastMessages[0].getProps().roomId,
            senderId: lastMessages[0].getProps().senderId,
            content: lastMessages[0].getProps().content,
            type: lastMessages[0].getProps().type,
            isRead: lastMessages[0].getProps().isRead,
            createdAt: lastMessages[0].getProps().createdAt,
          } : undefined,
          createdAt: props.createdAt,
          updatedAt: props.updatedAt,
        };
      })
    );

    return result;
  }
}
