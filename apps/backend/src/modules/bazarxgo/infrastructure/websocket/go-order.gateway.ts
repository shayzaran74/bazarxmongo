// apps/backend/src/modules/bazarxgo/infrastructure/websocket/go-order.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GoOrderStatusValue } from '@barterborsa/shared-persistence';

const rawWsOrigin = process.env.WS_CORS_ORIGIN || '';
const WS_CORS_ORIGIN: string | string[] | false = rawWsOrigin
  ? rawWsOrigin.split(',').map(o => o.trim())
  : false;

export interface GoOrderStatusPayload {
  orderId: string;
  status: GoOrderStatusValue;
  updatedAt: Date;
}

@WebSocketGateway({
  namespace: 'go',
  cors: { origin: WS_CORS_ORIGIN, credentials: true },
})
export class GoOrderGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GoOrderGateway.name);

  @WebSocketServer()
  server!: Server;

  afterInit(): void {
    this.logger.log('GoOrderGateway başlatıldı (namespace: /go)');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`GO client bağlandı: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`GO client ayrıldı: ${client.id}`);
  }

  // İstemci sipariş takip odasına katılır
  @SubscribeMessage('order:watch')
  handleWatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() orderId: string,
  ): { success: boolean } {
    client.join(`go:order:${orderId}`);
    this.logger.log(`${client.id} → go:order:${orderId} odasına katıldı`);
    return { success: true };
  }

  // Handler ve scheduler tarafından çağrılır — durumu tüm dinleyicilere yayınla
  notifyStatusChange(payload: GoOrderStatusPayload): void {
    this.server
      .to(`go:order:${payload.orderId}`)
      .emit('go:order:status', payload);
    this.logger.log(`Durum yayını: order=${payload.orderId} → ${payload.status}`);
  }
}
