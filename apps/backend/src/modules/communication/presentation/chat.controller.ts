import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam 
} from '@nestjs/swagger';
import { CurrentUser } from '@barterborsa/shared-nest';
import { CreateChatRoomDto, SendMessageDto } from '../application/dtos/chat.dtos';
import { CreateChatRoomCommand } from '../application/commands/create-chat-room.command';
import { SendMessageCommand } from '../application/commands/send-message.command';
import { GetChatRoomsQuery } from '../application/queries/get-chat-rooms.query';
import { GetMessagesQuery } from '../application/queries/get-messages.query';
import { JwtAuthGuard } from '@barterborsa/shared-security';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'List chat rooms', description: 'Kullanıcının dahil olduğu tüm sohbet odalarını listeler.' })
  @ApiResponse({ status: 200, description: 'Sohbet odaları listesi.' })
  @Get('rooms')
  async getRooms(@CurrentUser() user: any) {
    return this.queryBus.execute(new GetChatRoomsQuery(user.id));
  }

  @ApiOperation({ summary: 'Get messages in room', description: 'Belirli bir sohbet odasındaki mesaj geçmişini döner.' })
  @ApiParam({ name: 'id', description: 'Sohbet odası ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'before', required: false, type: String, description: 'Belirli bir tarihten önceki mesajları getirir (Pagination)' })
  @ApiResponse({ status: 200, description: 'Mesaj listesi.' })
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

  @ApiOperation({ summary: 'Get unread message count', description: 'Kullanıcının tüm odalardaki okunmamış mesajlarının toplamını döner.' })
  @ApiResponse({ status: 200, description: 'Okunmamış mesaj sayısı.' })
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    return { count: 0 }; // Placeholder
  }
}
