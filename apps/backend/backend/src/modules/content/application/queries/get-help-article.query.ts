import { Query } from '@barterborsa/shared-core';

export class GetHelpArticleQuery extends Query {
  constructor(public readonly slug: string) { super(); }
}
