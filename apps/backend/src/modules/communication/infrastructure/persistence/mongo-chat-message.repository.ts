// apps/backend/src/modules/communication/infrastructure/persistence/mongo-chat-message.repository.ts
// ChatMessage repository — Mongoose implementation (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ChatMessage as ChatMessageModel, IChatMessage } from '@barterborsa/shared-persistence/schemas/backend/chatMessage.schema';
import { IChatMessageRepository } from '../../domain/repositories/chat-message.repository.interface';
import { ChatMessage } from '../../domain/entities/chat-message.entity';
import { ChatMessageMapper } from './mappers/chat-message.mapper';

export interface ChatMessageDocument extends IChatMessage {
  _id?: string;
}

@Injectable()
export class MongoChatMessageRepository implements IChatMessageRepository {
  private readonly model: Model<ChatMessageDocument>;

  constructor() {
    this.model = ChatMessageModel as Model<ChatMessageDocument>;
  }

  async findById(id: string): Promise<ChatMessage | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? ChatMessageMapper.toDomain(doc) : null;
  }

  async findByRoomId(roomId: string, options?: { limit?: number; before?: Date }): Promise<ChatMessage[]> {
    const filter: Record<string, unknown> = { roomId };
    if (options?.before) {
      filter.createdAt = { $lt: options.before };
    }
    const docs = await this.model.find(filter, {}, {
      sort: { createdAt: -1 },
      limit: options?.limit || 50,
    }).exec();
    return docs.map(doc => ChatMessageMapper.toDomain(doc));
  }

  async countUnread(roomId: string, userId: string): Promise<number> {
    return this.model.countDocuments({
      roomId,
      isRead: false,
      senderId: { $ne: userId },
    }).exec();
  }

  async getTotalUnread(userId: string): Promise<number> {
    return this.model.countDocuments({
      isRead: false,
      senderId: { $ne: userId },
    }).exec();
  }

  async markAllRead(roomId: string, userId: string): Promise<void> {
    await this.model.updateMany(
      { roomId, isRead: false, senderId: { $ne: userId } },
      { $set: { isRead: true, readAt: new Date(), readById: userId } }
    ).exec();
  }

  async save(message: ChatMessage): Promise<void> {
    const data = ChatMessageMapper.toPersistence(message);
    await this.model.updateOne({ id: message.id }, { $set: data }, { upsert: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findAll(): Promise<ChatMessage[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => ChatMessageMapper.toDomain(doc));
  }
}