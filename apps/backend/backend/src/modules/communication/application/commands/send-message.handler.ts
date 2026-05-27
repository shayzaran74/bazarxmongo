// apps/backend/src/modules/communication/application/commands/send-message.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SendMessageCommand } from './send-message.command';
import { IChatMessageRepository } from '../../domain/repositories/chat-message.repository.interface';
import { IChatRoomRepository } from '../../domain/repositories/chat-room.repository.interface';
import { ChatMessage } from '../../domain/entities/chat-message.entity';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand> {
  constructor(
    @Inject('IChatRoomRepository') private readonly roomRepo: IChatRoomRepository,
    @Inject('IChatMessageRepository') private readonly messageRepo: IChatMessageRepository,
  ) {}

  async execute(command: SendMessageCommand) {
    const room = await this.roomRepo.findById(command.roomId);
    if (!room) throw new DomainException('Chat room not found');

    if (command.senderId && !room.isParticipant(command.senderId)) {
      throw new DomainException('User is not a participant in this room');
    }

    let message: ChatMessage;

    switch (command.type) {
      case ChatMessageType.SYSTEM:
        message = ChatMessage.createSystem(command.roomId, command.content);
        break;
      case ChatMessageType.IMAGE:
        message = ChatMessage.createImage(command.roomId, command.senderId!, command.content);
        break;
      default:
        message = ChatMessage.createText(command.roomId, command.senderId!, command.content);
    }

    await this.messageRepo.save(message);

    return { 
      success: true, 
      id: message.id, 
      createdAt: message.getProps().createdAt 
    };
  }
}
