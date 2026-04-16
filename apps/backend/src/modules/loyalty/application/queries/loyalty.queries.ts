// apps/backend/src/modules/loyalty/application/queries/loyalty.queries.ts

import { Query } from '@barterborsa/shared-core';

export class GetUserLevelQuery extends Query {
  constructor(public readonly userId: string) { super(); }
}

export class GetXpBalanceQuery extends Query {
  constructor(public readonly userId: string) { super(); }
}

export class GetXpHistoryQuery extends Query {
  constructor(
    public readonly userId: string,
    public readonly skip: number = 0,
    public readonly take: number = 20
  ) { super(); }
}

export class GetMissionsQuery extends Query {
  constructor() { super(); }
}

export class GetUserMissionsQuery extends Query {
  constructor(public readonly userId: string) { super(); }
}
