// apps/backend/src/modules/communication/application/event-handlers/trade-offer-accepted-notification.handler.ts

import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { CreateNotificationCommand } from '../commands/create-notification.command';
import { CreateChatRoomCommand } from '../commands/create-chat-room.command';
import { SendMessageCommand } from '../commands/send-message.command';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';
import { NotificationType } from '../../domain/enums/notification-type.enum';

export interface TradeOfferAcceptedEvent {
  offerId: string;
  sessionId: string;
  fromCompanyId: string;
  toCompanyId: string;
  initiatorId: string;
  receiverId: string;
  collateralAmount: string;
}

@Injectable()
export class TradeOfferAcceptedNotificationHandler {
  constructor(private readonly commandBus: CommandBus) {}

  @RabbitSubscribe({
    exchange: 'barter.events',
    routingKey: 'offer.accepted',
    queue: 'communication.trade-offer-accepted',
  })
  async handle(event: TradeOfferAcceptedEvent) {
    const { offerId, initiatorId, receiverId } = event;

    // 1. Notify Both Parties
    await this.commandBus.execute(
      new CreateNotificationCommand(
        initiatorId,
        NotificationType.BARTER_OFFER,
        'Takas Teklifi Kabul Edildi',
        'Takas teklifiniz karşı tarafça kabul edildi. Görüşmeye başlayabilirsiniz.',
        '/barter/offers'
      )
    );

    await this.commandBus.execute(
      new CreateNotificationCommand(
        receiverId,
        NotificationType.BARTER_OFFER,
        'Takas Teklifi Kabul Edildi',
        'Takas teklifini kabul ettiniz. Görüşmeye başlayabilirsiniz.',
        '/barter/offers'
      )
    );

    // 2. Create Chat Room
    const roomResult = await this.commandBus.execute(
      new CreateChatRoomCommand(undefined, offerId)
    );

    // 3. System Message
    if (roomResult.success) {
      await this.commandBus.execute(
        new SendMessageCommand(
          roomResult.id,
          null,
          'Takas teklifi kabul edildi. Bu oda üzerinden detayları görüşebilirsiniz.',
          ChatMessageType.SYSTEM
        )
      );
    }
  }
}
