// apps/backend/src/modules/vendor/application/queries/list-vendors.query.ts

import { Query } from '@barterborsa/shared-core';

export class ListVendorsQuery extends Query {
  constructor(public readonly params: any) {
    super();
  }
}
