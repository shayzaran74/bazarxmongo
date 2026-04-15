import { Query } from '@barterborsa/shared-core';

export class GetAddressesQuery extends Query {
  constructor(public readonly userId: string) {
    super();
  }
}
