// apps/backend/src/modules/content/infrastructure/persistence/mappers/help.mappers.ts

import { HelpCategory } from '../../../domain/entities/help-category.entity';
import { HelpArticle } from '../../../domain/entities/help-article.entity';

export class HelpCategoryMapper {
  static toDomain(raw: any): HelpCategory {
    return HelpCategory.create({
      name: raw.name,
      slug: raw.slug,
      description: raw.description || undefined,
      icon: raw.icon || undefined,
      order: raw.order,
      language: raw.language,
      isActive: raw.isActive,
      parentId: raw.parentId || undefined,
      platform: raw.platform,
    }, raw.id);
  }

  static toPersistence(domain: HelpCategory): any {
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
  static toDomain(raw: any): HelpArticle {
    return HelpArticle.create({
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      excerpt: raw.excerpt || undefined,
      status: raw.status,
      order: raw.order,
      language: raw.language,
      categoryId: raw.categoryId || undefined,
      isActive: raw.isActive,
      isPopular: raw.isPopular,
      platform: raw.platform,
    }, raw.id);
  }

  static toPersistence(domain: HelpArticle): any {
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
