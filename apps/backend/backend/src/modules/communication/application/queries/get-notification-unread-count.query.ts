// apps/backend/src/modules/communication/application/queries/get-notification-unread-count.query.ts

import { Query } from '@barterborsa/shared-core';

export class GetNotificationUnreadCountQuery extends Query {
  constructor(public readonly userId: string) {
    super();
  }
}
