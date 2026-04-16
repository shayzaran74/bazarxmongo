// apps/backend/src/modules/communication/infrastructure/persistence/prisma-notification.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationMapper } from './mappers/notification.mapper';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: NotificationMapper
  ) {}

  async findById(id: string): Promise<Notification | null> {
    const raw = await this.prisma.notification.findUnique({ where: { id } });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<Notification[]> {
    const raws = await this.prisma.notification.findMany({
      where: { userId },
      take: options?.limit || 20,
      skip: options?.offset || 0,
      orderBy: { createdAt: 'desc' }
    });
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false }
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }

  async save(notification: Notification): Promise<void> {
    const data = this.mapper.toPersistence(notification);
    await this.prisma.notification.upsert({
      where: { id: notification.id },
      update: data,
      create: data,
    });
  }

  async saveMany(notifications: Notification[]): Promise<void> {
    const data = notifications.map(n => this.mapper.toPersistence(n));
    // Prisma doesn't have a clean upsertMany, so we use createMany for bulk if IDs are unique
    await this.prisma.notification.createMany({
      data: data,
      skipDuplicates: true
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({ where: { id } });
  }

  async findAll(): Promise<Notification[]> {
    const raws = await this.prisma.notification.findMany();
    return raws.map(raw => this.mapper.toDomain(raw));
  }
}
