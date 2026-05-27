// apps/backend/src/modules/vendor/application/queries/get-vendor-by-slug.query.ts

import { Query } from '@barterborsa/shared-core';

export class GetVendorBySlugQuery extends Query {
  constructor(public readonly slug: string) {
    super();
  }
}
