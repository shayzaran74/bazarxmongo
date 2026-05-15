// apps/backend/src/modules/commerce/application/commands/ship-order-item.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ShipOrderItemCommand } from './ship-order-item.command';

@CommandHandler(ShipOrderItemCommand)
export class ShipOrderItemHandler implements ICommandHandler<ShipOrderItemCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ShipOrderItemCommand) {
    const { orderItemId, userId, trackingNumber, carrier } = command;

    // Siparişi ve satıcı yetkisini kontrol et
    const order = await this.prisma.order.findUnique({
      where:   { id: orderItemId },
    });

    if (!order) throw new NotFoundException('Sipariş bulunamadı.');

    // Yetki kontrolü: Sadece ilgili satıcı kargo girişi yapabilir
    if (order.vendorId) {
      const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
      if (!vendor || vendor.id !== order.vendorId) {
        throw new ForbiddenException('Bu sipariş üzerinde işlem yapma yetkiniz yok.');
      }
    }

    // Siparişi güncelle (Mevcut şemada takip bilgisi Order seviyesinde)
    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        trackingNumber,
        shippingCarrier: carrier,
        status: 'SHIPPED',
      }
    });

    return updatedOrder;
  }
}
