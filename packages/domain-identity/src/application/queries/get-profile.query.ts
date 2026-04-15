import { Query } from '@barterborsa/shared-core';

export class GetProfileQuery extends Query {
  constructor(public readonly userId: string) {
    super();
  }
}
