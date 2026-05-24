// apps/backend/src/modules/communication/infrastructure/websocket/chat.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { SendMessageCommand } from '../../application/commands/send-message.command';
import { SendMessageDto } from '../../application/dtos/send-message.dto';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';

interface ExtendedSocket extends Socket {
  userId?: string;
}

const rawWsOrigin = process.env.WS_CORS_ORIGIN || '';
const WS_CORS_ORIGIN: string | string[] | false = rawWsOrigin
  ? rawWsOrigin.split(',').map((o) => o.trim())
  : false;

@WebSocketGateway({
  cors: { origin: WS_CORS_ORIGIN, credentials: true },
})
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // JWT token handshake.auth.token'dan alınır
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        this.logger.warn(`WebSocket bağlantısı reddedildi: token yok (${client.id})`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.userId;
      if (!userId) {
        this.logger.warn(`WebSocket bağlantısı reddedildi: geçersiz payload (${client.id})`);
        client.disconnect();
        return;
      }

      (client as ExtendedSocket).userId = userId;
      client.join(`user:${userId}`);
      this.logger.log(`Client connected: ${client.id}, user: ${userId}`);
    } catch (err) {
      this.logger.warn(`WebSocket bağlantısı reddedildi: auth hatası (${client.id})`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string
  ) {
    const userId = (client as ExtendedSocket).userId;
    client.join(`chat:${roomId}`);
    return { success: true, roomId };
  }

  @SubscribeMessage('joinTradeRoom')
  async handleJoinTradeRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tradeOfferId: string }
  ) {
    const userId = (client as ExtendedSocket).userId;
    if (!userId) return { success: false, message: 'Unauthorized' };

    try {
      const room = await this.commandBus.execute(
        new (require('../commands/create-chat-room.command').CreateChatRoomCommand)(data.tradeOfferId, null)
      );

      if (room.success && room.data?.id) {
        const chatRoomId = room.data.id;
        client.join(`chat:${chatRoomId}`);
        this.logger.log(`User ${userId} joined trade room ${data.tradeOfferId} → chat room ${chatRoomId}`);
        return { success: true, chatRoomId };
      }

      return { success: false, message: 'Chat room not found' };
    } catch (err) {
      this.logger.error('joinTradeRoom error', { tradeOfferId: data.tradeOfferId, error: err });
      return { success: false, message: 'Failed to join room' };
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto & { roomId: string }
  ) {
    const userId = (client as ExtendedSocket).userId;

    const result = await this.commandBus.execute(
      new SendMessageCommand(
        data.roomId,
        userId ?? null,
        data.content,
        data.type || ChatMessageType.TEXT
      )
    );

    if (result.success) {
      // Broadcast to room
      this.server.to(`chat:${data.roomId}`).emit('message:new', {
        id: result.id,
        roomId: data.roomId,
        senderId: userId,
        content: data.content,
        type: data.type || ChatMessageType.TEXT,
        createdAt: result.createdAt,
      });
    }

    return result;
  }

  @SubscribeMessage('user:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean }
  ) {
    const userId = (client as ExtendedSocket).userId;
    client.to(`chat:${data.roomId}`).emit('user:typing', {
      userId,
      isTyping: data.isTyping,
    });
  }

  /**
   * Bildirimi belirli bir kullanıcıya veya tüm kullanıcılara WebSocket üzerinden gönderir.
   */
  sendNotification(userId: string, notification: Record<string, unknown>) {
    if (!userId || userId === '') {
      // Tüm bağlı kullanıcılara gönder (Broadcast)
      this.server.emit('notification', notification);
    } else {
      // Sadece belirli kullanıcı odasına gönder
      this.server.to(`user:${userId}`).emit('notification', notification);
    }
  }
}
