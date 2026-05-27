import { Query } from '@barterborsa/shared-core';

export class GetUserMissionsQuery extends Query {
  constructor(public readonly userId: string) { super(); }
}
