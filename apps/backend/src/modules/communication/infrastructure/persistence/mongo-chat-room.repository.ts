// apps/backend/src/modules/communication/infrastructure/persistence/mongo-chat-room.repository.ts
// ChatRoom repository — Mongoose implementation (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ChatRoom as ChatRoomModel, IChatRoom } from '@barterborsa/shared-persistence/schemas/backend/chatRoom.schema';
import { IChatRoomRepository } from '../../domain/repositories/chat-room.repository.interface';
import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { ChatRoomMapper } from './mappers/chat-room.mapper';

export interface ChatRoomDocument extends IChatRoom {
  _id?: string;
  status?: string;
}

@Injectable()
export class MongoChatRoomRepository implements IChatRoomRepository {
  private readonly model: Model<ChatRoomDocument>;

  constructor() {
    this.model = ChatRoomModel as Model<ChatRoomDocument>;
  }

  async findById(id: string): Promise<ChatRoom | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? ChatRoomMapper.toDomain(doc) : null;
  }

  async findByOrderId(orderId: string): Promise<ChatRoom | null> {
    const doc = await this.model.findOne({ orderId }).exec();
    return doc ? ChatRoomMapper.toDomain(doc) : null;
  }

  async findByTradeOfferId(tradeOfferId: string): Promise<ChatRoom | null> {
    const doc = await this.model.findOne({ tradeOfferId }).exec();
    return doc ? ChatRoomMapper.toDomain(doc) : null;
  }

  async findByParticipantId(userId: string): Promise<ChatRoom[]> {
    const docs = await this.model.find(
      { participantIds: { $in: [userId] } }
    ).sort({ updatedAt: -1 }).exec();
    return docs.map(doc => ChatRoomMapper.toDomain(doc));
  }

  async save(room: ChatRoom): Promise<void> {
    const data = ChatRoomMapper.toPersistence(room);
    await this.model.updateOne({ id: room.id }, { $set: data }, { upsert: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findAll(): Promise<ChatRoom[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => ChatRoomMapper.toDomain(doc));
  }
}