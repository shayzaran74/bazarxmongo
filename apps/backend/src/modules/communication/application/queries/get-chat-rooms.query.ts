// apps/backend/src/modules/communication/application/queries/get-chat-rooms.query.ts

import { Query } from '@barterborsa/shared-core';

export class GetChatRoomsQuery extends Query {
  constructor(public readonly userId: string) {
    super();
  }
}
