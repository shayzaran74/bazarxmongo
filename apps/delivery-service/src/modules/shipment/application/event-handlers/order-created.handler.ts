import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { CommandBus } from '@nestjs/cqrs';
import { CreateShipmentCommand } from '../commands/create-shipment.command';

@Injectable()
export class OrderCreatedHandler {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @RabbitSubscribe({
    exchange: 'commerce.events',
    routingKey: 'order.created',
    queue: 'delivery.shipment.order_created',
  })
  async handle(msg: any) {
    this.logger.log(`[OrderCreated] Event received for Order: ${msg.orderId}`);

    try {
      // Sipariş oluşturulduğunda otomatik kargo kaydı aç
      await this.commandBus.execute(new CreateShipmentCommand({
        orderId: msg.orderId,
        senderId: msg.sellerId,
        receiverId: msg.buyerId,
        vendorId: msg.vendorId || msg.sellerId, // VendorID yoksa SellerID kullan
        type: 'ORDER',
        senderAddress: msg.shippingAddress, // Mesajda geldiğini varsayıyoruz
        receiverAddress: msg.billingAddress || msg.shippingAddress,
        packageInfo: msg.packageDetails,
      }));

      this.logger.log(`[OrderCreated] Shipment automatically created for Order: ${msg.orderId}`);
    } catch (error: any) {
      this.logger.error(`[OrderCreated] Failed to process event: ${error.message}`);
    }
  }
}
