// apps/backend/src/modules/vendor/application/queries/list-vendors.query.ts

import { Query } from '@barterborsa/shared-core';

export class ListVendorsQuery extends Query {
  constructor(public readonly params: { page?: string; limit?: string; status?: string; tier?: string; vendorType?: string; search?: string }) {
    super();
  }
}
