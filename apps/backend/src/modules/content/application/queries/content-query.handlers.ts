// apps/backend/src/modules/content/application/queries/content-query.handlers.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as qry from './content.queries';
import { IHomeBannerRepository } from '../../domain/repositories/home-banner.repository.interface';
import { IHomeQuadCardRepository } from '../../domain/repositories/home-quad-card.repository.interface';
import { IHelpCategoryRepository } from '../../domain/repositories/help-category.repository.interface';
import { IHelpArticleRepository } from '../../domain/repositories/help-article.repository.interface';
import { IAnnouncementRepository } from '../../domain/repositories/announcement.repository.interface';
import { IPolicyRepository } from '../../domain/repositories/policy.repository.interface';
import { IDynamicContentRepository } from '../../domain/repositories/dynamic-content.repository.interface';
import { ISeoMetadataRepository } from '../../domain/repositories/seo-metadata.repository.interface';

@QueryHandler(qry.GetHomeBannersQuery)
export class GetHomeBannersHandler implements IQueryHandler<qry.GetHomeBannersQuery> {
  constructor(@Inject('IHomeBannerRepository') private readonly repository: IHomeBannerRepository) {}
  async execute(query: qry.GetHomeBannersQuery) {
    return this.repository.findAllActive(query.platform);
  }
}

@QueryHandler(qry.GetHomeQuadCardsQuery)
export class GetHomeQuadCardsHandler implements IQueryHandler<qry.GetHomeQuadCardsQuery> {
  constructor(@Inject('IHomeQuadCardRepository') private readonly repository: IHomeQuadCardRepository) {}
  async execute(query: qry.GetHomeQuadCardsQuery) {
    return this.repository.findAllActive(query.platform);
  }
}

@QueryHandler(qry.GetHelpCategoriesQuery)
export class GetHelpCategoriesHandler implements IQueryHandler<qry.GetHelpCategoriesQuery> {
  constructor(@Inject('IHelpCategoryRepository') private readonly repository: IHelpCategoryRepository) {}
  async execute(query: qry.GetHelpCategoriesQuery) {
    return this.repository.findAllRoots(query.platform, query.language);
  }
}

@QueryHandler(qry.GetHelpArticleQuery)
export class GetHelpArticleHandler implements IQueryHandler<qry.GetHelpArticleQuery> {
  constructor(@Inject('IHelpArticleRepository') private readonly repository: IHelpArticleRepository) {}
  async execute(query: qry.GetHelpArticleQuery) {
    const article = await this.repository.findBySlug(query.slug);
    if (article) {
      article.incrementViewCount();
      await this.repository.save(article);
    }
    return article;
  }
}

@QueryHandler(qry.SearchHelpArticlesQuery)
export class SearchHelpArticlesHandler implements IQueryHandler<qry.SearchHelpArticlesQuery> {
  constructor(@Inject('IHelpArticleRepository') private readonly repository: IHelpArticleRepository) {}
  async execute(query: qry.SearchHelpArticlesQuery) {
    return this.repository.search(query.text, query.platform, query.language);
  }
}

@QueryHandler(qry.GetAnnouncementsQuery)
export class GetAnnouncementsHandler implements IQueryHandler<qry.GetAnnouncementsQuery> {
  constructor(@Inject('IAnnouncementRepository') private readonly repository: IAnnouncementRepository) {}
  async execute() {
    return this.repository.findAllActive();
  }
}

@QueryHandler(qry.GetPoliciesQuery)
export class GetPoliciesHandler implements IQueryHandler<qry.GetPoliciesQuery> {
  constructor(@Inject('IPolicyRepository') private readonly repository: IPolicyRepository) {}
  async execute() {
    const policies = await this.repository.findAllActive();
    return policies.map(p => ({
      id: p.id.toString(),
      ...p.getProps()
    }));
  }
}

@QueryHandler(qry.GetPolicyBySlugQuery)
export class GetPolicyBySlugHandler implements IQueryHandler<qry.GetPolicyBySlugQuery> {
  constructor(@Inject('IPolicyRepository') private readonly repository: IPolicyRepository) {}
  async execute(query: qry.GetPolicyBySlugQuery) {
    const policy = await this.repository.findBySlug(query.slug);
    if (!policy) return null;
    return {
      id: policy.id.toString(),
      ...policy.getProps()
    };
  }
}

@QueryHandler(qry.GetDynamicContentQuery)
export class GetDynamicContentHandler implements IQueryHandler<qry.GetDynamicContentQuery> {
  constructor(@Inject('IDynamicContentRepository') private readonly repository: IDynamicContentRepository) {}
  async execute(query: qry.GetDynamicContentQuery) {
    return this.repository.findByKey(query.key);
  }
}

@QueryHandler(qry.GetSeoMetadataQuery)
export class GetSeoMetadataHandler implements IQueryHandler<qry.GetSeoMetadataQuery> {
  constructor(@Inject('ISeoMetadataRepository') private readonly repository: ISeoMetadataRepository) {}
  async execute(query: qry.GetSeoMetadataQuery) {
    return this.repository.findByPath(query.path, query.platform);
  }
}
