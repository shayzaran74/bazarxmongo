// apps/backend/src/modules/catalog/domain/entities/category.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Slug } from '../value-objects/slug.vo';
import { CategoryType } from '../enums/category-type.enum';

export interface CategoryProps {
  name: string;
  slug: Slug;
  parentId?: string;
  description?: string;
  icon?: string;
  image?: string;
  order: number;
  isActive: boolean;
  type: CategoryType;
  badgeText?: string;
  badgeColor?: string;
  attributeTemplate?: any;
  isFeatured: boolean;
}

export class Category extends AggregateRoot<CategoryProps> {
  protected constructor(props: CategoryProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: CategoryProps, id: string): Category {
    return new Category(props, id);
  }

  public static create(props: Omit<CategoryProps, 'isActive' | 'order' | 'isFeatured'>): Category {
    return new Category({
      ...props,
      isActive: true,
      order: 0,
      isFeatured: false,
    });
  }

  public update(props: Partial<CategoryProps>): void {
    Object.assign(this.props, props);
    this._updatedAt = new Date();
  }

  // Getters
  get name(): string { return this.props.name; }
  get slug(): Slug { return this.props.slug; }
  get parentId(): string | undefined { return this.props.parentId; }
}
