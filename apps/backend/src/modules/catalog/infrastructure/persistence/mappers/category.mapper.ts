// apps/backend/src/modules/catalog/infrastructure/persistence/mappers/category.mapper.ts

import { Category, CategoryProps } from '../../../domain/entities/category.entity';
import { Slug } from '../../../domain/value-objects/slug.vo';
import { CategoryType } from '../../../domain/enums/category-type.enum';
import { Category as PrismaCategory } from '@prisma/client';

export class CategoryMapper {
  public static toDomain(record: PrismaCategory): Category {
    const slugResult = Slug.create(record.slug);
    
    const props: CategoryProps = {
      name: record.name,
      slug: slugResult.success ? slugResult.data : Slug.fromText(record.slug),
      parentId: record.parentId || undefined,
      description: record.description || undefined,
      icon: record.icon || undefined,
      image: record.image || undefined,
      order: record.order,
      isActive: record.isActive,
      type: record.type as CategoryType,
      badgeText: record.badgeText || undefined,
      badgeColor: record.badgeColor || undefined,
      attributeTemplate: record.attributeTemplate,
      isFeatured: record.isFeatured,
    };

    return Category.fromPersistence(props, record.id);
  }

  public static toPersistence(domain: Category): any {
    const props = domain.getProps();
    
    return {
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
      updatedAt: new Date(),
    };
  }
}
