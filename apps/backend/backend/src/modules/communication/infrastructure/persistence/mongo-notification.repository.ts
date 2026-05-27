// apps/backend/src/modules/communication/infrastructure/persistence/mongo-notification.repository.ts
// Notification repository — Mongoose implementation (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Notification as NotificationModel, INotification } from '@barterborsa/shared-persistence/schemas/backend/notification.schema';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationMapper } from './mappers/notification.mapper';

export interface NotificationDocument extends INotification {
  _id?: string;
}

@Injectable()
export class MongoNotificationRepository implements INotificationRepository {
  private readonly model: Model<NotificationDocument>;

  constructor() {
    this.model = NotificationModel as Model<NotificationDocument>;
  }

  async findById(id: string): Promise<Notification | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? NotificationMapper.toDomain(doc) : null;
  }

  async findByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<Notification[]> {
    const docs = await this.model.find(
      { userId },
      {},
      { sort: { createdAt: -1 }, skip: options?.offset || 0, limit: options?.limit || 20 }
    ).exec();
    return docs.map(doc => NotificationMapper.toDomain(doc));
  }

  async countUnread(userId: string): Promise<number> {
    return this.model.countDocuments({ userId, isRead: false }).exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.model.updateMany({ userId, isRead: false }, { $set: { isRead: true } }).exec();
  }

  async save(notification: Notification): Promise<void> {
    const data = NotificationMapper.toPersistence(notification);
    await this.model.updateOne({ id: notification.id }, { $set: data }, { upsert: true }).exec();
  }

  async saveMany(notifications: Notification[]): Promise<void> {
    const ops = notifications.map(n => {
      const data = NotificationMapper.toPersistence(n);
      return { insertOne: { document: data } };
    });
    if (ops.length > 0) {
      await this.model.db.collection('notifications').bulkWrite(ops, { ordered: false });
    }
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findAll(): Promise<Notification[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => NotificationMapper.toDomain(doc));
  }
}