// apps/backend/src/modules/communication/application/commands/mark-messages-read.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MarkMessagesReadCommand } from './mark-messages-read.command';
import { IChatMessageRepository } from '../../domain/repositories/chat-message.repository.interface';

@CommandHandler(MarkMessagesReadCommand)
export class MarkMessagesReadHandler implements ICommandHandler<MarkMessagesReadCommand> {
  constructor(
    @Inject('IChatMessageRepository') private readonly messageRepo: IChatMessageRepository,
  ) {}

  async execute(command: MarkMessagesReadCommand) {
    await this.messageRepo.markAllRead(command.roomId, command.userId);
    return { success: true };
  }
}
