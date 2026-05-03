// apps/backend/src/modules/communication/application/commands/create-notification.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateNotificationCommand } from './create-notification.command';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { ChatGateway } from '../../infrastructure/websocket/chat.gateway';

@CommandHandler(CreateNotificationCommand)
export class CreateNotificationHandler implements ICommandHandler<CreateNotificationCommand> {
  constructor(
    @Inject('INotificationRepository') private readonly repository: INotificationRepository,
    private readonly gateway: ChatGateway,
  ) {}

    // Eğer userId boşsa (Broadcast), veritabanına kaydetmek için 
    // geçerli bir kullanıcı ID'si gerekebilir. Şimdilik broadcast bildirimleri 
    // WebSocket üzerinden anlık gider, DB kaydı için bir ID zorunludur.
    const targetUserId = command.userId || 'system-broadcast';

    const notification = Notification.create(
      targetUserId,
      command.type,
      command.title,
      command.message,
      command.link,
      command.metadata
    );

    await this.repository.save(notification);

    // Real-time push via WebSocket
    this.gateway.sendNotification(command.userId, {
      id: notification.id,
      type: notification.getProps().type,
      title: notification.getProps().title,
      message: notification.getProps().message,
      link: notification.getProps().link,
      createdAt: notification.getProps().createdAt,
    });

    return { success: true, id: notification.id };
  }
}
