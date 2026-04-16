// apps/backend/src/modules/communication/application/commands/create-chat-room.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateChatRoomCommand } from './create-chat-room.command';
import { IChatRoomRepository } from '../../domain/repositories/chat-room.repository.interface';
import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { DomainException } from '@barterborsa/shared-core';
import { PrismaService } from '@barterborsa/shared-persistence';

@CommandHandler(CreateChatRoomCommand)
export class CreateChatRoomHandler implements ICommandHandler<CreateChatRoomCommand> {
  constructor(
    @Inject('IChatRoomRepository') private readonly repository: IChatRoomRepository,
    private readonly prisma: PrismaService, // To fetch order/trade details if needed
  ) {}

  async execute(command: CreateChatRoomCommand) {
    if (command.orderId) {
      const existing = await this.repository.findByOrderId(command.orderId);
      if (existing) return { success: true, id: existing.id };

      const order = await (this.prisma as any).order.findUnique({ where: { id: command.orderId } });
      if (!order) throw new DomainException('Order not found');

      const room = ChatRoom.createForOrder(order.id, order.userId, order.vendorId);
      await this.repository.save(room);
      return { success: true, id: room.id };
    }

    if (command.tradeOfferId) {
      const existing = await this.repository.findByTradeOfferId(command.tradeOfferId);
      if (existing) return { success: true, id: existing.id };

      const trade = await (this.prisma as any).tradeOffer.findUnique({ where: { id: command.tradeOfferId } });
      if (!trade) throw new DomainException('Trade offer not found');

      const room = ChatRoom.createForTrade(trade.id, trade.initiatorId, trade.receiverId);
      await this.repository.save(room);
      return { success: true, id: room.id };
    }

    throw new DomainException('orderId or tradeOfferId is required');
  }
}
