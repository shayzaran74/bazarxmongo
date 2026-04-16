// apps/backend/src/modules/communication/application/queries/get-messages.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMessagesQuery } from './get-messages.query';
import { IChatMessageRepository } from '../../domain/repositories/chat-message.repository.interface';
import { IChatRoomRepository } from '../../domain/repositories/chat-room.repository.interface';
import { MessageResponseDto } from '../dtos/chat.dtos';
import { DomainException } from '@barterborsa/shared-core';

@QueryHandler(GetMessagesQuery)
export class GetMessagesHandler implements IQueryHandler<GetMessagesQuery> {
  constructor(
    @Inject('IChatRoomRepository') private readonly roomRepo: IChatRoomRepository,
    @Inject('IChatMessageRepository') private readonly messageRepo: IChatMessageRepository,
  ) {}

  async execute(query: GetMessagesQuery): Promise<MessageResponseDto[]> {
    const room = await this.roomRepo.findById(query.roomId);
    if (!room) throw new DomainException('Chat room not found');

    if (!room.isParticipant(query.userId)) {
      throw new DomainException('User is not a participant in this room');
    }

    const messages = await this.messageRepo.findByRoomId(query.roomId, {
      limit: query.limit,
      before: query.before
    });

    return messages.map(msg => ({
      id: msg.id,
      roomId: msg.getProps().roomId,
      senderId: msg.getProps().senderId,
      content: msg.getProps().content,
      type: msg.getProps().type,
      isRead: msg.getProps().isRead,
      createdAt: msg.getProps().createdAt,
    }));
  }
}
