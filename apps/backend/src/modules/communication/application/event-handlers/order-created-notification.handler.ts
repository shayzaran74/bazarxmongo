// apps/backend/src/modules/communication/application/event-handlers/order-created-notification.handler.ts

import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationTemplateService } from '../services/notification-template.service';
import { CreateNotificationCommand } from '../commands/create-notification.command';
import { CreateChatRoomCommand } from '../commands/create-chat-room.command';
import { SendMessageCommand } from '../commands/send-message.command';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';
import { NotificationType } from '../../domain/enums/notification-type.enum';

export interface OrderCreatedEvent {
  orderId: string;
  id: string;
  orderNumber: string;
  userId: string;
  buyerId: string;
  sellerId: string;
  vendorId: string;
  totalAmount: string;
  shippingAddress: unknown;
  billingAddress: unknown;
}

@Injectable()
export class OrderCreatedNotificationHandler {
  private readonly logger = new Logger(OrderCreatedNotificationHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly templateService: NotificationTemplateService,
  ) {}

  @RabbitSubscribe({
    exchange: 'commerce.events',
    routingKey: 'order.created',
    queue: 'communication.order-created',
  })
  async handle(event: OrderCreatedEvent) {
    const { id, orderNumber, userId } = event;

    // Notification — fire-and-forget, ana akışı (chat room) bloke etmemeli
    const template = this.templateService.getOrderCreatedTemplate(orderNumber, id);
    this.commandBus
      .execute(new CreateNotificationCommand(userId, NotificationType.ORDER_STATUS, template.title, template.message, template.link))
      .catch((err: unknown) => this.logger.error('Sipariş bildirimi gönderilemedi', { userId, orderId: id, err }));

    // Chat room oluştur — kritik akış
    const roomResult = await this.commandBus.execute(new CreateChatRoomCommand(id));

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
