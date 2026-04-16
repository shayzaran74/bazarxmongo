// apps/backend/src/modules/communication/application/commands/create-notification.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateNotificationCommand } from './create-notification.command';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';

@CommandHandler(CreateNotificationCommand)
export class CreateNotificationHandler implements ICommandHandler<CreateNotificationCommand> {
  constructor(
    @Inject('INotificationRepository') private readonly repository: INotificationRepository,
  ) {}

  async execute(command: CreateNotificationCommand) {
    const notification = Notification.create(
      command.userId,
      command.type,
      command.title,
      command.message,
      command.link,
      command.metadata
    );

    await this.repository.save(notification);

    return { success: true, id: notification.id };
  }
}
