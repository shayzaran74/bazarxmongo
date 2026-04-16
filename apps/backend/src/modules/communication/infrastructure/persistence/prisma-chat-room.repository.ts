// apps/backend/src/modules/communication/infrastructure/persistence/prisma-chat-room.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IChatRoomRepository } from '../../domain/repositories/chat-room.repository.interface';
import { ChatRoom } from '../../domain/entities/chat-room.entity';
import { ChatRoomMapper } from './mappers/chat-room.mapper';

@Injectable()
export class PrismaChatRoomRepository implements IChatRoomRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: ChatRoomMapper
  ) {}

  async findById(id: string): Promise<ChatRoom | null> {
    const raw = await this.prisma.chatRoom.findUnique({ where: { id } });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findByOrderId(orderId: string): Promise<ChatRoom | null> {
    const raw = await this.prisma.chatRoom.findUnique({ where: { orderId } });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findByTradeOfferId(tradeOfferId: string): Promise<ChatRoom | null> {
    const raw = await this.prisma.chatRoom.findUnique({ where: { tradeOfferId } });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findByParticipantId(userId: string): Promise<ChatRoom[]> {
    const raws = await this.prisma.chatRoom.findMany({
      where: {
        participantIds: { has: userId }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(room: ChatRoom): Promise<void> {
    const data = this.mapper.toPersistence(room);
    await this.prisma.chatRoom.upsert({
      where: { id: room.id },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.chatRoom.delete({ where: { id } });
  }

  async findAll(): Promise<ChatRoom[]> {
    const raws = await this.prisma.chatRoom.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }
}
