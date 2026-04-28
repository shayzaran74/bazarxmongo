// apps/backend/src/modules/content/application/queries/content-query.handlers.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetHomeBannersQuery } from './get-home-banners.query';
import { GetHomeQuadCardsQuery } from './get-home-quad-cards.query';
import { GetHelpCategoriesQuery } from './get-help-categories.query';
import { GetHelpArticleQuery } from './get-help-article.query';
import { SearchHelpArticlesQuery } from './search-help-articles.query';
import { GetAnnouncementsQuery } from './get-announcements.query';
import { GetPoliciesQuery } from './get-policies.query';
import { GetPolicyBySlugQuery } from './get-policy-by-slug.query';
import { GetDynamicContentQuery } from './get-dynamic-content.query';
import { GetSeoMetadataQuery } from './get-seo-metadata.query';
import { IHomeBannerRepository } from '../../domain/repositories/home-banner.repository.interface';
import { IHomeQuadCardRepository } from '../../domain/repositories/home-quad-card.repository.interface';
import { IHelpCategoryRepository } from '../../domain/repositories/help-category.repository.interface';
import { IHelpArticleRepository } from '../../domain/repositories/help-article.repository.interface';
import { IAnnouncementRepository } from '../../domain/repositories/announcement.repository.interface';
import { IPolicyRepository } from '../../domain/repositories/policy.repository.interface';
import { IDynamicContentRepository } from '../../domain/repositories/dynamic-content.repository.interface';
import { ISeoMetadataRepository } from '../../domain/repositories/seo-metadata.repository.interface';

@QueryHandler(GetHomeBannersQuery)
export class GetHomeBannersHandler implements IQueryHandler<GetHomeBannersQuery> {
  constructor(@Inject('IHomeBannerRepository') private readonly repository: IHomeBannerRepository) {}
  async execute(query: GetHomeBannersQuery) {
    const banners = await this.repository.findAllActive(query.platform, query.tag);
    return banners.map(b => ({ id: b.id, ...b.getProps() }));
  }
}

@QueryHandler(GetHomeQuadCardsQuery)
export class GetHomeQuadCardsHandler implements IQueryHandler<GetHomeQuadCardsQuery> {
  constructor(@Inject('IHomeQuadCardRepository') private readonly repository: IHomeQuadCardRepository) {}
  async execute(query: GetHomeQuadCardsQuery) { return this.repository.findAllActive(query.platform); }
}

@QueryHandler(GetHelpCategoriesQuery)
export class GetHelpCategoriesHandler implements IQueryHandler<GetHelpCategoriesQuery> {
  constructor(@Inject('IHelpCategoryRepository') private readonly repository: IHelpCategoryRepository) {}
  async execute(query: GetHelpCategoriesQuery) { return this.repository.findAllRoots(query.platform, query.language); }
}

@QueryHandler(GetHelpArticleQuery)
export class GetHelpArticleHandler implements IQueryHandler<GetHelpArticleQuery> {
  constructor(@Inject('IHelpArticleRepository') private readonly repository: IHelpArticleRepository) {}
  async execute(query: GetHelpArticleQuery) {
    const article = await this.repository.findBySlug(query.slug);
    if (article) { article.incrementViewCount(); await this.repository.save(article); }
    return article;
  }
}

@QueryHandler(SearchHelpArticlesQuery)
export class SearchHelpArticlesHandler implements IQueryHandler<SearchHelpArticlesQuery> {
  constructor(@Inject('IHelpArticleRepository') private readonly repository: IHelpArticleRepository) {}
  async execute(query: SearchHelpArticlesQuery) { return this.repository.search(query.text, query.platform, query.language); }
}

@QueryHandler(GetAnnouncementsQuery)
export class GetAnnouncementsHandler implements IQueryHandler<GetAnnouncementsQuery> {
  constructor(@Inject('IAnnouncementRepository') private readonly repository: IAnnouncementRepository) {}
  async execute() { return this.repository.findAllActive(); }
}

@QueryHandler(GetPoliciesQuery)
export class GetPoliciesHandler implements IQueryHandler<GetPoliciesQuery> {
  constructor(@Inject('IPolicyRepository') private readonly repository: IPolicyRepository) {}
  async execute() {
    const policies = await this.repository.findAllActive();
    return policies.map(p => ({ id: p.id.toString(), ...p.getProps() }));
  }
}

@QueryHandler(GetPolicyBySlugQuery)
export class GetPolicyBySlugHandler implements IQueryHandler<GetPolicyBySlugQuery> {
  constructor(@Inject('IPolicyRepository') private readonly repository: IPolicyRepository) {}
  async execute(query: GetPolicyBySlugQuery) {
    const policy = await this.repository.findBySlug(query.slug);
    if (!policy) return null;
    return { id: policy.id.toString(), ...policy.getProps() };
  }
}

@QueryHandler(GetDynamicContentQuery)
export class GetDynamicContentHandler implements IQueryHandler<GetDynamicContentQuery> {
  constructor(@Inject('IDynamicContentRepository') private readonly repository: IDynamicContentRepository) {}
  async execute(query: GetDynamicContentQuery) { return this.repository.findByKey(query.key); }
}

@QueryHandler(GetSeoMetadataQuery)
export class GetSeoMetadataHandler implements IQueryHandler<GetSeoMetadataQuery> {
  constructor(@Inject('ISeoMetadataRepository') private readonly repository: ISeoMetadataRepository) {}
  async execute(query: GetSeoMetadataQuery) { return this.repository.findByPath(query.path, query.platform); }
}
