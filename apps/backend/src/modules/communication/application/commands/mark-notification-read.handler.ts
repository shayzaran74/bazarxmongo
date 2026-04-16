// apps/backend/src/modules/communication/application/commands/mark-notification-read.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MarkNotificationReadCommand } from './mark-notification-read.command';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadHandler implements ICommandHandler<MarkNotificationReadCommand> {
  constructor(
    @Inject('INotificationRepository') private readonly repository: INotificationRepository,
  ) {}

  async execute(command: MarkNotificationReadCommand) {
    const notification = await this.repository.findById(command.notificationId);
    if (!notification) throw new DomainException('Notification not found');
    if (notification.getProps().userId !== command.userId) {
      throw new DomainException('Notification does not belong to user');
    }

    notification.markAsRead();
    await this.repository.save(notification);

    return { success: true };
  }
}
