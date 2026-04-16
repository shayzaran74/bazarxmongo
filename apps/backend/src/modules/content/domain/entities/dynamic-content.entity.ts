// apps/backend/src/modules/content/domain/entities/dynamic-content.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface DynamicContentProps {
  key: string;
  title: string;
  content: string;
  category?: string;
  contentType: string; // text, html, json, markdown
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DynamicContent extends AggregateRoot<DynamicContentProps> {
  private constructor(props: DynamicContentProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<DynamicContentProps, 'createdAt' | 'updatedAt'>, id?: string): DynamicContent {
    return new DynamicContent({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id);
  }
}
