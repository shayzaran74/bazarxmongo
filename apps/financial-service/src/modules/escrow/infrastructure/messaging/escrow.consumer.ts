// apps/financial-service/src/modules/escrow/infrastructure/messaging/escrow.consumer.ts

import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { CommandBus } from '@nestjs/cqrs';
import { CreateEscrowCommand } from '../../application/commands/create-escrow.command';

@Injectable()
export class EscrowConsumer {
  private readonly logger = new Logger(EscrowConsumer.name);

  constructor(private readonly commandBus: CommandBus) {}

  @RabbitSubscribe({
    exchange: 'commerce.events',
    routingKey: 'order.created',
    queue: 'financial.escrow.order_created',
  })
  async handleOrderCreated(msg: any) {
    this.logger.log(`[OrderCreated] Event received for Order: ${msg.orderId}`);

    try {
      // Sipariş oluşturulduğunda otomatik olarak emanet (escrow) kaydı aç
      await this.commandBus.execute(
        new CreateEscrowCommand(
          msg.orderId,
          msg.buyerId,
          msg.sellerId,
          msg.totalAmount
        )
      );
      
      this.logger.log(`[OrderCreated] Escrow successfully initialized for Order: ${msg.orderId}`);
    } catch (error: any) {
      this.logger.error(`[OrderCreated] Failed to create escrow: ${error.message}`);
    }
  }
}
