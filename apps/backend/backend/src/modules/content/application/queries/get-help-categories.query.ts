import { Query } from '@barterborsa/shared-core';

export class GetHelpCategoriesQuery extends Query {
  constructor(public readonly platform: string = 'BAZARX', public readonly language: string = 'tr') { super(); }
}
