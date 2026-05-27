import { Query } from '@barterborsa/shared-core';

export class GetXpHistoryQuery extends Query {
  constructor(
    public readonly userId: string,
    public readonly skip: number = 0,
    public readonly take: number = 20
  ) { super(); }
}
