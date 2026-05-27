// apps/backend/src/modules/content/domain/entities/help-category.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface HelpCategoryProps {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  language: string;
  isActive: boolean;
  parentId?: string;
  platform: string;
  createdAt: Date;
  updatedAt: Date;
}

export class HelpCategory extends AggregateRoot<HelpCategoryProps> {
  private constructor(props: HelpCategoryProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<HelpCategoryProps, 'createdAt' | 'updatedAt'>, id?: string): HelpCategory {
    return new HelpCategory({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id);
  }

  public update(props: Partial<Omit<HelpCategoryProps, 'createdAt' | 'updatedAt'>>): void {
    Object.assign(this.props, props);
    this.props.updatedAt = new Date();
  }
}
