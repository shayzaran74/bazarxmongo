import { Query } from '@barterborsa/shared-core';

export class GetHomeBannersQuery extends Query {
  constructor(
    public readonly platform: string = 'BAZARX',
    public readonly tag?: string
  ) { super(); }
}
