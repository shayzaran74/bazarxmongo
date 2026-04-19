// apps/backend/src/modules/communication/application/event-handlers/order-created-notification.handler.ts

import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { RabbitRPC, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { NotificationTemplateService } from '../services/notification-template.service';
import { CreateNotificationCommand } from '../commands/create-notification.command';
import { CreateChatRoomCommand } from '../commands/create-chat-room.command';
import { SendMessageCommand } from '../commands/send-message.command';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';

@Injectable()
export class OrderCreatedNotificationHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly templateService: NotificationTemplateService,
  ) {}

  @RabbitSubscribe({
    exchange: 'commerce.events',
    routingKey: 'order.created',
    queue: 'communication.order-created',
  })
  async handle(event: any) {
    const { id, orderNumber, userId, vendorId } = event;

    // 1. Create Notification for Buyer
    const template = this.templateService.getOrderCreatedTemplate(orderNumber, id);
    await this.commandBus.execute(
      new CreateNotificationCommand(userId, 'ORDER_STATUS', template.title, template.message, template.link)
    );

    // 2. Create Chat Room
    const roomResult = await this.commandBus.execute(
      new CreateChatRoomCommand(id)
    );

    // 3. Send System Message to Chat
    if (roomResult.success) {
      await this.commandBus.execute(
        new SendMessageCommand(
          roomResult.id,
          null,
          `Sipariş #${orderNumber} oluşturuldu. Bu oda üzerinden satıcı ile iletişime geçebilirsiniz.`,
          ChatMessageType.SYSTEM
        )
      );
    }
  }
}
