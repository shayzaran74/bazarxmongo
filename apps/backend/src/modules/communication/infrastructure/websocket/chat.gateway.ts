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
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SendMessageCommand } from '../../application/commands/send-message.command';
import { SendMessageDto } from '../../application/dtos/chat.dtos';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';

import { Public } from '@barterborsa/shared-security';

@Public()
@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // In real scenario, extract token from handshake: client.handshake.auth.token
      // Verify JWT and attach userId to client
      const userId = client.handshake.query.userId as string; // Placeholder for logic
      if (!userId) {
        client.disconnect();
        return;
      }
      (client as any).userId = userId;
      console.log(`Client connected: ${client.id}, user: ${userId}`);
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
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
    @MessageBody() data: { roomId: string; content: string; type?: ChatMessageType }
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
}
