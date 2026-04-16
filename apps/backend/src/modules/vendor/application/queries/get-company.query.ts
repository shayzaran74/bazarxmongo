// apps/backend/src/modules/vendor/application/queries/get-company.query.ts

import { Query } from '@barterborsa/shared-core';

export class GetCompanyQuery extends Query {
  constructor(public readonly id: string) {
    super();
  }
}
