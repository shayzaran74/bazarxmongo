import { Query } from '@barterborsa/shared-core';

export class GetUserQuery extends Query {
  constructor(public readonly userId: string) {
    super();
  }
}
