// apps/backend/src/modules/content/application/queries/content.queries.ts

import { Query } from '@barterborsa/shared-core';

export class GetHomeBannersQuery extends Query {
  constructor(public readonly platform: string = 'BAZARX') { super(); }
}

export class GetHomeQuadCardsQuery extends Query {
  constructor(public readonly platform: string = 'BAZARX') { super(); }
}

export class GetHelpCategoriesQuery extends Query {
  constructor(public readonly platform: string = 'BAZARX', public readonly language: string = 'tr') { super(); }
}

export class GetHelpArticleQuery extends Query {
  constructor(public readonly slug: string) { super(); }
}

export class SearchHelpArticlesQuery extends Query {
  constructor(
    public readonly text: string,
    public readonly platform: string = 'BAZARX',
    public readonly language: string = 'tr'
  ) { super(); }
}

export class GetAnnouncementsQuery extends Query {
  constructor() { super(); }
}

export class GetPoliciesQuery extends Query {
  constructor() { super(); }
}

export class GetPolicyBySlugQuery extends Query {
  constructor(public readonly slug: string) { super(); }
}

export class GetDynamicContentQuery extends Query {
  constructor(public readonly key: string) { super(); }
}

export class GetSeoMetadataQuery extends Query {
  constructor(public readonly path: string, public readonly platform: string = 'BAZARX') { super(); }
}
