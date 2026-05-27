// apps/backend/src/modules/catalog/infrastructure/persistence/mappers/category.mapper.ts
// CategoryMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { ICategory } from '@barterborsa/shared-persistence/schemas/backend/category.schema';
import { Category, CategoryProps } from '../../../domain/entities/category.entity';
import { Slug } from '../../../domain/value-objects/slug.vo';
import { CategoryType } from '../../../domain/enums/category-type.enum';

export interface CategoryDocument extends ICategory {
  _id?: string;
}

export class CategoryMapper {
  public static toDomain(doc: CategoryDocument): Category {
    const slugResult = Slug.create(doc.slug);

    const props: CategoryProps = {
      name: doc.name,
      slug: slugResult.success ? slugResult.data : Slug.fromText(doc.slug),
      parentId: doc.parentId ?? undefined,
      description: doc.description ?? undefined,
      icon: doc.icon ?? undefined,
      image: doc.image ?? undefined,
      order: doc.order,
      isActive: doc.isActive,
      type: doc.type as CategoryType,
      badgeText: doc.badgeText ?? undefined,
      badgeColor: doc.badgeColor ?? undefined,
      attributeTemplate: doc.attributeTemplate as Record<string, unknown> | undefined,
      isFeatured: doc.isFeatured,
    };

    return Category.fromPersistence(props, doc.id);
  }

  public static toPersistence(domain: Category): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      name: props.name,
      slug: props.slug.value,
      parentId: props.parentId,
      description: props.description,
      icon: props.icon,
      image: props.image,
      order: props.order,
      isActive: props.isActive,
      type: props.type,
      badgeText: props.badgeText,
      badgeColor: props.badgeColor,
      attributeTemplate: props.attributeTemplate,
      isFeatured: props.isFeatured,
    };
  }
}