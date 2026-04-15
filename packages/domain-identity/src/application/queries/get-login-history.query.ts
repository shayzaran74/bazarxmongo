import { Query } from '@barterborsa/shared-core';

export class GetLoginHistoryQuery extends Query {
  constructor(public readonly userId: string) {
    super();
  }
}
