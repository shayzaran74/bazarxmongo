// apps/backend/src/modules/communication/presentation/chat.controller.ts

import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiQuery, ApiParam,
} from '@nestjs/swagger';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateChatRoomDto } from '../application/dtos/create-chat-room.dto';
import { SendMessageDto } from '../application/dtos/send-message.dto';
import { CreateChatRoomCommand } from '../application/commands/create-chat-room.command';
import { SendMessageCommand } from '../application/commands/send-message.command';
import { GetChatRoomsQuery } from '../application/queries/get-chat-rooms.query';
import { GetMessagesQuery } from '../application/queries/get-messages.query';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Chat odalarını listele' })
  @ApiResponse({ status: 200 })
  @Get('rooms')
  async getRooms(@CurrentUser() user: any) {
    return this.queryBus.execute(new GetChatRoomsQuery(user.id));
  }

  @ApiOperation({ summary: 'Odadaki mesajları getir' })
  @ApiParam({ name: 'id' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'before', required: false, type: String })
  @ApiResponse({ status: 200 })
  @Get('rooms/:id/messages')
  async getMessages(
    @CurrentUser() user: any,
    @Param('id') roomId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.queryBus.execute(
      new GetMessagesQuery(
        roomId,
        user.id,
        limit ? Number(limit) : 50,
        before ? new Date(before) : undefined,
      ),
    );
  }

  @ApiOperation({ summary: 'Okunmamış mesaj sayısı' })
  @ApiResponse({ status: 200 })
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    // Kullanıcının dahil olduğu odalardaki okunmamış mesajları say
    const count = await this.prisma.chatMessage.count({
      where: {
        isRead:   false,
        senderId: { not: user.id }, // kendi gönderdiği hariç
        room: {
          participantIds: { has: user.id },
          isArchived: false,
        },
      },
    });
    return { success: true, count };
  }
}
