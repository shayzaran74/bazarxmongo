// apps/backend/src/modules/communication/application/event-handlers/order-created-notification.handler.ts

import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationTemplateService } from '../services/notification-template.service';
import { CreateNotificationCommand } from '../commands/create-notification.command';
import { CreateChatRoomCommand } from '../commands/create-chat-room.command';
import { SendMessageCommand } from '../commands/send-message.command';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { MailService } from '../../infrastructure/mail/mail.service';
import { IUser } from '@barterborsa/shared-persistence/schemas/backend/user.schema';

export interface OrderCreatedEvent {
  orderId: string;
  id: string;
  orderNumber: string;
  userId: string;
  buyerId: string;
  sellerId: string;
  vendorId: string;
  vendorUserId?: string;
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
    private readonly mailService: MailService,
    @InjectModel('User') private readonly userModel: Model<IUser>,
  ) {}

  @RabbitSubscribe({
    exchange: 'commerce.events',
    routingKey: 'order.created',
    queue: 'communication.order-created',
  })
  async handle(event: OrderCreatedEvent) {
    const { id, orderNumber, userId, vendorUserId } = event;

    // 1. Alıcıya bildirim
    const buyerTemplate = this.templateService.getOrderCreatedTemplate(orderNumber, id);
    this.commandBus
      .execute(new CreateNotificationCommand(userId, NotificationType.ORDER_STATUS, buyerTemplate.title, buyerTemplate.message, buyerTemplate.link))
      .catch((err: unknown) => this.logger.error('Sipariş bildirimi gönderilemedi', { userId, orderId: id, err }));

    // 2. Satıcıya bildirim ve E-posta
    this.logger.log(`OrderCreated event alındı. vendorUserId: ${vendorUserId}, orderNumber: ${orderNumber}`);
    if (vendorUserId) {
      const vendorTemplate = this.templateService.getOrderCreatedTemplate(orderNumber, id);
      const vendorMessage = `Yeni bir siparişiniz var: #${orderNumber}. Detayları kontrol edebilirsiniz.`;

      this.commandBus
        .execute(new CreateNotificationCommand(vendorUserId, NotificationType.ORDER_STATUS, "Yeni Sipariş Alındı", vendorMessage, `/vendor/orders/${id}`))
        .catch((err: unknown) => this.logger.error('Satıcıya sipariş bildirimi gönderilemedi', { vendorUserId, orderId: id, err }));

      // Satıcı mailini bul ve e-posta gönder
      try {
        const vendorUser = await this.userModel.findOne({ id: vendorUserId }).exec();
        if (vendorUser && vendorUser.email) {
          const emailHtml = `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;color:#111">
              <h2 style="margin:0 0 16px">Yeni Siparişiniz Var!</h2>
              <p>Mağazanıza yeni bir sipariş geldi.</p>
              <div style="background:#f4f4f4;padding:16px;font-size:20px;font-weight:700;text-align:center;border-radius:8px;margin:16px 0">
                Sipariş No: #${orderNumber}
              </div>
              <p style="font-size:14px;color:#666">Lütfen Satıcı Paneli üzerinden sipariş detaylarını kontrol edip onaylayın.</p>
              <a href="https://www.bazarx.info/vendor/orders/${id}" style="display:inline-block;background:#4F46E5;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-top:16px;">Siparişi Görüntüle</a>
            </div>`;
          await this.mailService.sendMail(vendorUser.email, `Yeni Sipariş Alındı: #${orderNumber}`, emailHtml);
        }
      } catch (err: unknown) {
        this.logger.error('Satıcıya sipariş e-postası gönderilemedi', { vendorUserId, orderId: id, err });
      }
    }

    // 3. Chat room oluştur — kritik akış
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
