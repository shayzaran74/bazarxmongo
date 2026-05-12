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

const WS_CORS_ORIGIN = process.env.WS_CORS_ORIGIN || '*';

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

      (client as any).userId = userId;
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
    const userId = (client as any).userId;
    // Check if user is participant (can be done via query or repository)
    // For now we assume they can join if they know the ID (add security later)
    client.join(`chat:${roomId}`);
    return { success: true, roomId };
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto & { roomId: string }
  ) {
    const userId = (client as any).userId;

    const result = await this.commandBus.execute(
      new SendMessageCommand(
        data.roomId,
        userId,
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
    const userId = (client as any).userId;
    client.to(`chat:${data.roomId}`).emit('user:typing', {
      userId,
      isTyping: data.isTyping,
    });
  }

  /**
   * Bildirimi belirli bir kullanıcıya veya tüm kullanıcılara WebSocket üzerinden gönderir.
   */
  sendNotification(userId: string, notification: any) {
    if (!userId || userId === '') {
      // Tüm bağlı kullanıcılara gönder (Broadcast)
      this.server.emit('notification', notification);
    } else {
      // Sadece belirli kullanıcı odasına gönder
      this.server.to(`user:${userId}`).emit('notification', notification);
    }
  }
}
