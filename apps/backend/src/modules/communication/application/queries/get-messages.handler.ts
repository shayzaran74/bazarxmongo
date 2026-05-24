// apps/backend/src/modules/communication/application/queries/get-messages.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GetMessagesQuery } from './get-messages.query';
import { IChatMessageRepository } from '../../domain/repositories/chat-message.repository.interface';
import { IChatRoomRepository } from '../../domain/repositories/chat-room.repository.interface';
import { MessageResponseDto } from '../dtos/message-response.dto';
import { DomainException } from '@barterborsa/shared-core';

@QueryHandler(GetMessagesQuery)
export class GetMessagesHandler implements IQueryHandler<GetMessagesQuery> {
  constructor(
    @Inject('IChatRoomRepository') private readonly roomRepo: IChatRoomRepository,
    @Inject('IChatMessageRepository') private readonly messageRepo: IChatMessageRepository,
  ) {}

  private readonly logger = new Logger(GetMessagesHandler.name);

  async execute(query: GetMessagesQuery): Promise<MessageResponseDto[]> {
    this.logger.debug(`getMessages: roomId=${query.roomId} userId=${query.userId}`);

    const room = await this.roomRepo.findById(query.roomId);
    if (!room) {
      this.logger.warn(`Room not found: ${query.roomId}`);
      throw new DomainException('Chat room not found');
    }

    this.logger.debug(`room participantIds=${JSON.stringify(room.getProps().participantIds)}`);

    if (!room.isParticipant(query.userId)) {
      this.logger.warn(`User ${query.userId} not participant in room ${query.roomId}`);
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
