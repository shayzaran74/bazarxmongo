// apps/backend/src/modules/commerce/application/commands/ship-order-item.handler.ts
// ShipOrderItemHandler — Mongoose migration (ADR-005 Faz 2b)

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { ShipOrderItemCommand } from './ship-order-item.command';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { MongoOrderRepository } from '../../infrastructure/persistence/mongo-order.repository';
import { MongoVendorRepository } from '../../../vendor/infrastructure/persistence/mongo-vendor.repository';

@CommandHandler(ShipOrderItemCommand)
export class ShipOrderItemHandler implements ICommandHandler<ShipOrderItemCommand> {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    private readonly vendorRepo:       MongoVendorRepository,
  ) {}

  async execute(command: ShipOrderItemCommand) {
    const { orderItemId, userId, trackingNumber, carrier } = command;

    const order = await this.orderRepository.findById(orderItemId);
    if (!order) throw new NotFoundException('Sipariş bulunamadı.');

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor || vendor.id !== order.vendorId) {
      throw new ForbiddenException('Bu sipariş üzerinde işlem yapma yetkiniz yok.');
    }

    // MongoDB: order seviyesinde güncelle
    await (this.orderRepository as MongoOrderRepository).updateShipping(
      order.id,
      trackingNumber,
      carrier,
    );

    return { success: true, orderId: order.id, status: 'SHIPPED' };
  }
}
