// apps/backend/src/modules/communication/infrastructure/persistence/mappers/notification.mapper.ts
// NotificationMapper — Prisma → Mongoose (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { INotification } from '@barterborsa/shared-persistence/schemas/backend/notification.schema';
import { Notification, NotificationProps } from '../../../domain/entities/notification.entity';

export interface NotificationDocument extends INotification {
  _id?: string;
}

@Injectable()
export class NotificationMapper {
  static toDomain(doc: NotificationDocument): Notification {
    const props: NotificationProps = {
      userId: doc.userId,
      type: (doc.metadata as unknown as Record<string, unknown> | null | undefined)?.type as string ?? doc.type ?? 'SYSTEM',
      title: doc.title,
      message: doc.message,
      link: doc.link ?? undefined,
      isRead: doc.isRead ?? false,
      metadata: doc.metadata as unknown as Record<string, unknown> | undefined,
      createdAt: doc.createdAt,
    };
    return Notification.createFrom(props, doc.id);
  }

  static toPersistence(domain: Notification): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
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