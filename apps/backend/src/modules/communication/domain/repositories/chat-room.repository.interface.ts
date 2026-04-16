// apps/backend/src/modules/communication/domain/repositories/chat-room.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { ChatRoom } from '../entities/chat-room.entity';

export interface IChatRoomRepository extends IRepository<ChatRoom> {
  findById(id: string): Promise<ChatRoom | null>;
  findByOrderId(orderId: string): Promise<ChatRoom | null>;
  findByTradeOfferId(tradeOfferId: string): Promise<ChatRoom | null>;
  findByParticipantId(userId: string): Promise<ChatRoom[]>;
  save(room: ChatRoom): Promise<void>;
}
