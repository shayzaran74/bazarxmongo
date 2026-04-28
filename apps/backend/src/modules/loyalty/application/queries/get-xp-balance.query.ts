import { Query } from '@barterborsa/shared-core';

export class GetXpBalanceQuery extends Query {
  constructor(public readonly userId: string) { super(); }
}
