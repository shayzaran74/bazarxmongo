// apps/backend/src/modules/communication/application/queries/get-notifications.query.ts

import { Query } from '@barterborsa/shared-core';

export class GetNotificationsQuery extends Query {
  constructor(
    public readonly userId: string,
    public readonly limit?: number,
    public readonly offset?: number
  ) {
    super();
  }
}
