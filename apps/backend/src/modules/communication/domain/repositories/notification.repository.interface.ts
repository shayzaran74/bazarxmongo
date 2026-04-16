// apps/backend/src/modules/communication/domain/repositories/notification.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Notification } from '../entities/notification.entity';

export interface INotificationRepository extends IRepository<Notification> {
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<Notification[]>;
  countUnread(userId: string): Promise<number>;
  markAllAsRead(userId: string): Promise<void>;
  save(notification: Notification): Promise<void>;
  saveMany(notifications: Notification[]): Promise<void>;
}
