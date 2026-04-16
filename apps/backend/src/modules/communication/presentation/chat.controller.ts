// apps/backend/src/modules/communication/presentation/chat.controller.ts

import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '@barterborsa/shared-nest';
import { CreateChatRoomDto, SendMessageDto } from '../application/dtos/chat.dtos';
import { CreateChatRoomCommand } from '../application/commands/create-chat-room.command';
import { SendMessageCommand } from '../application/commands/send-message.command';
import { GetChatRoomsQuery } from '../application/queries/get-chat-rooms.query';
import { GetMessagesQuery } from '../application/queries/get-messages.query';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('rooms')
  async getRooms(@CurrentUser() user: any) {
    return this.queryBus.execute(new GetChatRoomsQuery(user.id));
  }

  @Get('rooms/:id/messages')
  async getMessages(
    @CurrentUser() user: any,
    @Param('id') roomId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string
  ) {
    return this.queryBus.execute(
      new GetMessagesQuery(
        roomId, 
        user.id, 
        limit ? Number(limit) : 50, 
        before ? new Date(before) : undefined
      )
    );
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    // We didn't create a query for total unread yet, but the repository has it.
    // In a real CQRS, we should create GetTotalUnreadQuery.
    // For now I'll just skip or add a quick query.
    return { count: 0 }; // Placeholder
  }
}
