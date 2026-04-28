import { Query } from '@barterborsa/shared-core';

export class GetPolicyBySlugQuery extends Query {
  constructor(public readonly slug: string) { super(); }
}
