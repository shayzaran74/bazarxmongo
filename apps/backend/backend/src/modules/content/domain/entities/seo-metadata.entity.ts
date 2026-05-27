// apps/backend/src/modules/content/domain/entities/seo-metadata.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';

export interface SeoMetadataProps {
  path: string;
  title?: string;
  description?: string;
  keywords: string[];
  ogImage?: string;
  platform: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SeoMetadata extends AggregateRoot<SeoMetadataProps> {
  private constructor(props: SeoMetadataProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<SeoMetadataProps, 'createdAt' | 'updatedAt'>, id?: string): SeoMetadata {
    return new SeoMetadata({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id);
  }

  public update(props: Partial<Omit<SeoMetadataProps, 'createdAt' | 'updatedAt'>>): void {
    Object.assign(this.props, props);
    this.props.updatedAt = new Date();
  }
}
