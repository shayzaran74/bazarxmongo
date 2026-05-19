// apps/backend/src/modules/communication/application/commands/create-chat-room.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChatRoomCommand }     from './create-chat-room.command';
import { IChatRoomRepository }       from '../../domain/repositories/chat-room.repository.interface';
import { ChatRoom }                  from '../../domain/entities/chat-room.entity';
import { DomainException }           from '@barterborsa/shared-core';
import { IOrder, ITradeOffer }       from '@barterborsa/shared-persistence';

@CommandHandler(CreateChatRoomCommand)
export class CreateChatRoomHandler implements ICommandHandler<CreateChatRoomCommand> {
  constructor(
    @Inject('IChatRoomRepository') private readonly repository: IChatRoomRepository,
    @InjectModel('Order')      private readonly orderModel:     Model<IOrder>,
    @InjectModel('TradeOffer') private readonly tradeModel:     Model<ITradeOffer>,
  ) {}

  async execute(command: CreateChatRoomCommand) {
    if (command.orderId) {
      const existing = await this.repository.findByOrderId(command.orderId);
      if (existing) return { success: true, id: existing.id };

      const order = await this.orderModel.findOne({ id: command.orderId }).lean();
      if (!order) throw new DomainException('Order not found');

      const room = ChatRoom.createForOrder(order.id, order.userId, order.vendorId);
      await this.repository.save(room);
      return { success: true, id: room.id };
    }

    if (command.tradeOfferId) {
      const existing = await this.repository.findByTradeOfferId(command.tradeOfferId);
      if (existing) return { success: true, id: existing.id };

      const trade = await this.tradeModel.findOne({ id: command.tradeOfferId }).lean();
      if (!trade) throw new DomainException('Trade offer not found');

      const room = ChatRoom.createForTrade(
        trade.id,
        (trade as Record<string, unknown>).initiatorId as string,
        (trade as Record<string, unknown>).receiverId as string,
      );
      await this.repository.save(room);
      return { success: true, id: room.id };
    }

    throw new DomainException('orderId or tradeOfferId is required');
  }
}
