// apps/delivery-service/src/modules/shipment/application/event-handlers/barter-accepted.handler.ts

import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBarterShipmentsCommand } from '../commands/create-barter-shipments.command';

@Injectable()
export class BarterAcceptedHandler {
  private readonly logger = new Logger(BarterAcceptedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @RabbitSubscribe({
    exchange: 'barter.events',
    routingKey: 'offer.accepted',
    queue: 'delivery.shipment.barter_accepted',
  })
  async handle(msg: any) {
    this.logger.log(`[BarterAccepted] Event received for Session: ${msg.sessionId}`);

    try {
      // Barter kabul edildiğinde çift taraflı kargo oluşturulur
      await this.commandBus.execute(new CreateBarterShipmentsCommand({
        sessionId: msg.sessionId,
        offerId: msg.offerId,
        initiatorId: msg.initiatorId,
        receiverId: msg.receiverId,
        initiatorAddress: msg.fromAddress,
        receiverAddress: msg.toAddress,
      }));

      this.logger.log(`[BarterAccepted] Double shipments initiated for Session: ${msg.sessionId}`);
    } catch (error: any) {
      this.logger.error(`[BarterAccepted] Failed to initiate barter shipments: ${error.message}`);
    }
  }
}
