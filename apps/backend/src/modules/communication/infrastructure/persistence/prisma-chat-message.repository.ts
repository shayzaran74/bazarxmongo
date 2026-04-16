// apps/backend/src/modules/communication/infrastructure/persistence/prisma-chat-message.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IChatMessageRepository } from '../../domain/repositories/chat-message.repository.interface';
import { ChatMessage } from '../../domain/entities/chat-message.entity';
import { ChatMessageMapper } from './mappers/chat-message.mapper';

@Injectable()
export class PrismaChatMessageRepository implements IChatMessageRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: ChatMessageMapper
  ) {}

  async findById(id: string): Promise<ChatMessage | null> {
    const raw = await this.prisma.chatMessage.findUnique({ where: { id } });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findByRoomId(roomId: string, options?: { limit?: number; before?: Date }): Promise<ChatMessage[]> {
    const raws = await this.prisma.chatMessage.findMany({
      where: {
        roomId,
        ...(options?.before ? { createdAt: { lt: options.before } } : {})
      },
      take: options?.limit || 50,
      orderBy: { createdAt: 'desc' }
    });
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async countUnread(roomId: string, userId: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        roomId,
        isRead: false,
        senderId: { not: userId, notIn: [null] as any } // Messages not by user and not system
      }
    });
  }

  async getTotalUnread(userId: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        room: { participantIds: { has: userId } },
        isRead: false,
        senderId: { not: userId, notIn: [null] as any }
      }
    });
  }

  async markAllRead(roomId: string, userId: string): Promise<void> {
    await this.prisma.chatMessage.updateMany({
      where: {
        roomId,
        isRead: false,
        senderId: { not: userId }
      },
      data: {
        isRead: true,
        readAt: new Date(),
        readById: userId
      }
    });
  }

  async save(message: ChatMessage): Promise<void> {
    const data = this.mapper.toPersistence(message);
    await this.prisma.chatMessage.upsert({
      where: { id: message.id },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.chatMessage.delete({ where: { id } });
  }

  async findAll(): Promise<ChatMessage[]> {
    const raws = await this.prisma.chatMessage.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }
}
