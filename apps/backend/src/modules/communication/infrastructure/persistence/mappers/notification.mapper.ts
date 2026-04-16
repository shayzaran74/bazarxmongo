// apps/backend/src/modules/communication/infrastructure/persistence/mappers/notification.mapper.ts

import { Injectable } from '@nestjs/common';
import { Notification } from '../../../domain/entities/notification.entity';

@Injectable()
export class NotificationMapper {
  toDomain(raw: any): Notification {
    return (Notification as any).createFrom({
      ...raw,
      metadata: raw.metadata || undefined,
    }, raw.id);
  }

  toPersistence(domain: Notification): any {
    const props = domain.getProps();
    return {
      id: domain.id,
      userId: props.userId,
      type: props.type,
      title: props.title,
      message: props.message,
      link: props.link,
      isRead: props.isRead,
      metadata: props.metadata,
      createdAt: props.createdAt,
    };
  }
}
