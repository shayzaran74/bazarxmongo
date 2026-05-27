// apps/backend/src/modules/communication/domain/repositories/chat-message.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { ChatMessage } from '../entities/chat-message.entity';

export interface IChatMessageRepository extends IRepository<ChatMessage> {
  findById(id: string): Promise<ChatMessage | null>;
  findByRoomId(roomId: string, options?: { limit?: number; before?: Date }): Promise<ChatMessage[]>;
  countUnread(roomId: string, userId: string): Promise<number>;
  getTotalUnread(userId: string): Promise<number>;
  markAllRead(roomId: string, userId: string): Promise<void>;
  save(message: ChatMessage): Promise<void>;
}
