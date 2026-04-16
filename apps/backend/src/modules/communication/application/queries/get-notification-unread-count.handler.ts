// apps/backend/src/modules/communication/application/queries/get-notification-unread-count.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetNotificationUnreadCountQuery } from './get-notification-unread-count.query';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';

@QueryHandler(GetNotificationUnreadCountQuery)
export class GetNotificationUnreadCountHandler implements IQueryHandler<GetNotificationUnreadCountQuery> {
  constructor(
    @Inject('INotificationRepository') private readonly repository: INotificationRepository,
  ) {}

  async execute(query: GetNotificationUnreadCountQuery): Promise<{ count: number }> {
    const count = await this.repository.countUnread(query.userId);
    return { count };
  }
}
