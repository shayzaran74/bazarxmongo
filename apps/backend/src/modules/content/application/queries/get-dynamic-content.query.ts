import { Query } from '@barterborsa/shared-core';

export class GetDynamicContentQuery extends Query {
  constructor(public readonly key: string) { super(); }
}
