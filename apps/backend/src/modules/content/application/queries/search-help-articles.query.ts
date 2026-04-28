import { Query } from '@barterborsa/shared-core';

export class SearchHelpArticlesQuery extends Query {
  constructor(
    public readonly text: string,
    public readonly platform: string = 'BAZARX',
    public readonly language: string = 'tr'
  ) { super(); }
}
