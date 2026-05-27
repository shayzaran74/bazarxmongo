// apps/backend/src/modules/communication/application/queries/get-messages.query.ts

import { Query } from '@barterborsa/shared-core';

export class GetMessagesQuery extends Query {
  constructor(
    public readonly roomId: string,
    public readonly userId: string,
    public readonly limit?: number,
    public readonly before?: Date
  ) {
    super();
  }
}
