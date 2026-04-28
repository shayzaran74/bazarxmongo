import { Query } from '@barterborsa/shared-core';

export class GetUserLevelQuery extends Query {
  constructor(public readonly userId: string) { super(); }
}
