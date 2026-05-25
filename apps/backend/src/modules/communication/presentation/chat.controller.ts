// apps/backend/src/modules/communication/presentation/chat.controller.ts

import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { IChatMessage, IChatRoom } from '@barterborsa/shared-persistence';
import { CreateChatRoomDto }   from '../application/dtos/create-chat-room.dto';
import { SendMessageDto }      from '../application/dtos/send-message.dto';
import { CreateChatRoomCommand }    from '../application/commands/create-chat-room.command';
import { SendMessageCommand }       from '../application/commands/send-message.command';
import { MarkMessagesReadCommand }  from '../application/commands/mark-messages-read.command';
import { GetMessagesQuery }         from '../application/queries/get-messages.query';
import { GetChatRoomsQuery }        from '../application/queries/get-chat-rooms.query';

interface AuthenticatedUser { id: string; role: string }

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus:   QueryBus,
    @InjectModel('ChatMessage') private readonly msgModel: Model<IChatMessage>,
    @InjectModel('ChatRoom')    private readonly roomModel: Model<IChatRoom>,
  ) {}

  @Get('rooms')
  getRooms(@CurrentUser() user: AuthenticatedUser) {
    return this.queryBus.execute(new GetChatRoomsQuery(user.id));
  }

  @Get('rooms/:id/messages')
  getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') roomId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.queryBus.execute(
      new GetMessagesQuery(roomId, user.id, limit ? Number(limit) : 50, before ? new Date(before) : undefined),
    );
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Sohbet odası oluştur veya mevcut odayı getir (tradeOfferId ile)' })
  createRoom(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateChatRoomDto) {
    return this.commandBus.execute(
      new CreateChatRoomCommand(dto.orderId, dto.tradeOfferId, [user.id]),
    );
  }

  @Post('rooms/:id/messages')
  @ApiOperation({ summary: 'Odaya mesaj gönder' })
  @ApiParam({ name: 'id', description: 'Chat room ID' })
  sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') roomId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.commandBus.execute(
      new SendMessageCommand(roomId, user.id, dto.content, dto.type),
    );
  }

  @Post('rooms/:id/read')
  @ApiOperation({ summary: 'Odadaki tüm mesajları okundu işaretle' })
  @ApiParam({ name: 'id', description: 'Chat room ID' })
  markAsRead(@CurrentUser() user: AuthenticatedUser, @Param('id') roomId: string) {
    return this.commandBus.execute(new MarkMessagesReadCommand(roomId, user.id));
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    const rooms = await this.roomModel
      .find({ participantIds: user.id }, { id: 1, _id: 0 })
      .lean()
      .exec() as { id: string }[];

    if (rooms.length === 0) return { success: true, count: 0 };

    const roomIds = rooms.map(r => r.id);
    const count = await this.msgModel.countDocuments({
      roomId: { $in: roomIds },
      isRead: false,
      senderId: { $ne: user.id },
    });
    return { success: true, count };
  }
}
