// apps/backend/src/modules/content/infrastructure/persistence/mappers/help.mappers.ts

import { HelpCategory } from '../../../domain/entities/help-category.entity';
import { HelpArticle } from '../../../domain/entities/help-article.entity';
import { ArticleStatus } from '../../../domain/enums/article-status.enum';

export class HelpCategoryMapper {
  static toDomain(raw: Record<string, unknown>): HelpCategory {
    return HelpCategory.create({
      name: raw.name as string,
      slug: raw.slug as string,
      description: raw.description as string | undefined,
      icon: raw.icon as string | undefined,
      order: raw.order as number,
      language: raw.language as string,
      isActive: raw.isActive as boolean,
      parentId: raw.parentId as string | undefined,
      platform: raw.platform as string,
    }, raw.id as string);
  }

  static toPersistence(domain: HelpCategory): Record<string, unknown> {
    const props = domain.getProps();
    return {
      id: domain.id.toString(),
      name: props.name,
      slug: props.slug,
      description: props.description,
      icon: props.icon,
      order: props.order,
      language: props.language,
      isActive: props.isActive,
      parentId: props.parentId,
      platform: props.platform,
    };
  }
}

export class HelpArticleMapper {
  static toDomain(raw: Record<string, unknown>): HelpArticle {
    return HelpArticle.create({
      title: raw.title as string,
      slug: raw.slug as string,
      content: raw.content as string,
      excerpt: raw.excerpt as string | undefined,
      status: raw.status as ArticleStatus,
      order: raw.order as number,
      language: raw.language as string,
      categoryId: raw.categoryId as string | undefined,
      isActive: raw.isActive as boolean,
      isPopular: raw.isPopular as boolean,
      platform: raw.platform as string,
    }, raw.id as string);
  }

  static toPersistence(domain: HelpArticle): Record<string, unknown> {
    const props = domain.getProps();
    return {
      id: domain.id.toString(),
      title: props.title,
      slug: props.slug,
      content: props.content,
      excerpt: props.excerpt,
      status: props.status,
      order: props.order,
      language: props.language,
      categoryId: props.categoryId,
      isActive: props.isActive,
      isPopular: props.isPopular,
      platform: props.platform,
      viewCount: props.viewCount,
      upvotes: props.upvotes,
      downvotes: props.downvotes,
    };
  }
}
