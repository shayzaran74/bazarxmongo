// packages/shared/shared-persistence/src/mongodb/misc/analytics.repository.ts
// Analytics, Notification, SystemSetting repositories
// ADR-005 §2a: misc repositories

import { Injectable } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { Types } from 'mongoose';

import { AnalyticsEvent, IAnalyticsEvent, EventCategoryType } from '../../schemas/backend/analyticsEvent.schema';
import { Notification, INotification } from '../../schemas/backend/notification.schema';
import { SystemSetting, ISystemSetting } from '../../schemas/backend/systemSetting.schema';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly connection: Connection) {}

  async createEvent(input: {
    eventType: string;
    category: EventCategoryType;
    timestamp: Date;
    userId?: string;
    vendorId?: string;
    listingId?: string;
    sessionId?: string;
    referrer?: string;
    source?: string;
    medium?: string;
    campaign?: string;
    path?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: unknown;
  }): Promise<IAnalyticsEvent> {
    const doc = new AnalyticsEvent({
      id: new Types.ObjectId().toString(),
      eventType: input.eventType,
      category: input.category,
      timestamp: input.timestamp,
      userId: input.userId,
      vendorId: input.vendorId,
      listingId: input.listingId,
      sessionId: input.sessionId,
      referrer: input.referrer,
      source: input.source,
      medium: input.medium,
      campaign: input.campaign,
      path: input.path,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: input.metadata,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByUser(userId: string, limit = 100): Promise<IAnalyticsEvent[]> {
    return AnalyticsEvent.find({ userId }).sort({ timestamp: -1 }).limit(limit).lean();
  }

  async findByEventType(eventType: string, from: Date, to: Date): Promise<IAnalyticsEvent[]> {
    return AnalyticsEvent.find({ eventType, timestamp: { $gte: from, $lte: to } })
      .sort({ timestamp: -1 })
      .lean();
  }

  async countByCategory(category: EventCategoryType, from: Date, to: Date): Promise<number> {
    return AnalyticsEvent.countDocuments({ category, timestamp: { $gte: from, $lte: to } });
  }

  async aggregateByPath(from: Date, to: Date): Promise<{ path: string; count: number }[]> {
    const result = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: from, $lte: to } } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);
    return result.map(r => ({ path: r._id as string, count: r.count }));
  }
}

@Injectable()
export class NotificationRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    metadata?: unknown;
  }): Promise<INotification> {
    const doc = new Notification({
      id: new Types.ObjectId().toString(),
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      metadata: input.metadata,
      isRead: false,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByUser(userId: string, limit = 50): Promise<INotification[]> {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async findUnreadByUser(userId: string): Promise<INotification[]> {
    return Notification.find({ userId, isRead: false }).sort({ createdAt: -1 }).lean();
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const res = await Notification.updateOne(
      { _id: id, userId },
      { $set: { isRead: true, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async markAllRead(userId: string): Promise<number> {
    const res = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, updatedAt: new Date() } }
    );
    return res.modifiedCount;
  }

  async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false });
  }
}

@Injectable()
export class SystemSettingRepository {
  constructor(private readonly connection: Connection) {}

  async get(key: string): Promise<ISystemSetting | null> {
    return SystemSetting.findOne({ key }).lean();
  }

  async set(key: string, value: unknown, updatedBy?: string): Promise<ISystemSetting> {
    const existing = await SystemSetting.findOne({ key });
    if (existing) {
      await SystemSetting.updateOne(
        { _id: existing._id },
        { $set: { value, updatedBy, updatedAt: new Date() } }
      );
      const updated = await SystemSetting.findOne({ key });
      return updated!;
    }
    const doc = new SystemSetting({
      key,
      value,
      updatedBy,
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async delete(key: string): Promise<boolean> {
    const res = await SystemSetting.deleteOne({ key });
    return res.deletedCount > 0;
  }

  async getAll(): Promise<ISystemSetting[]> {
    return SystemSetting.find().lean();
  }
}