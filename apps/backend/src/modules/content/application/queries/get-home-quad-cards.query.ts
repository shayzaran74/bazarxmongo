import { Query } from '@barterborsa/shared-core';

export class GetHomeQuadCardsQuery extends Query {
  constructor(public readonly platform: string = 'BAZARX') { super(); }
}
