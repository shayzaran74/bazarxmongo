import { Query } from '@barterborsa/shared-core';

export class GetSeoMetadataQuery extends Query {
  constructor(public readonly path: string, public readonly platform: string = 'BAZARX') { super(); }
}
