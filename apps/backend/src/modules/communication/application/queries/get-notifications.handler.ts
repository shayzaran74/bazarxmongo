// apps/backend/src/modules/communication/application/queries/get-notifications.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetNotificationsQuery } from './get-notifications.query';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { NotificationResponseDto } from '../dtos/notification-complaint.dtos';

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
  constructor(
    @Inject('INotificationRepository') private readonly repository: INotificationRepository,
  ) {}

  async execute(query: GetNotificationsQuery): Promise<NotificationResponseDto[]> {
    const notifications = await this.repository.findByUserId(query.userId, {
      limit: query.limit,
      offset: query.offset
    });

    return notifications.map(n => {
      const props = n.getProps();
      return {
        id: n.id,
        type: props.type,
        title: props.title,
        message: props.message,
        link: props.link,
        isRead: props.isRead,
        createdAt: props.createdAt,
      };
    });
  }
}
