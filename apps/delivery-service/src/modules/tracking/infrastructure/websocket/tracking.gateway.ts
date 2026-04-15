import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'tracking',
  cors: { origin: '*' },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeToShipment')
  handleJoinShipment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { shipmentId: string }
  ) {
    const room = `shipment:${data.shipmentId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { status: 'subscribed', room };
  }

  @SubscribeMessage('unsubscribeFromShipment')
  handleLeaveShipment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { shipmentId: string }
  ) {
    const room = `shipment:${data.shipmentId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { status: 'unsubscribed', room };
  }

  public broadcastLocationUpdate(shipmentId: string, location: any) {
    const room = `shipment:${shipmentId}`;
    this.logger.log(`[WebSocket] Broadcating location update for room: ${room}`);
    this.server.to(room).emit('locationUpdate', {
      shipmentId,
      location,
      timestamp: new Date(),
    });
  }

  public broadcastTrackingEvent(shipmentId: string, event: any) {
    const room = `shipment:${shipmentId}`;
    this.logger.log(`[WebSocket] Broadcating tracking event for room: ${room}`);
    this.server.to(room).emit('trackingEvent', {
      shipmentId,
      event,
      timestamp: new Date(),
    });
  }
}
