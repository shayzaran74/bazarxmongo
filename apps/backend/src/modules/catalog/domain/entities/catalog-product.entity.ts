// apps/backend/src/modules/catalog/domain/entities/catalog-product.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Slug } from '../value-objects/slug.vo';
import { GTIN } from '../value-objects/gtin.vo';
import { Rating } from '../value-objects/rating.vo';

export interface ProductSpec {
  [key: string]: string | number | boolean;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface CatalogProductProps {
  name: string;
  slug: Slug;
  gtin?: GTIN;
  brand: string;
  description: string;
  specs?: ProductSpec;
  categoryId?: string;
  modelId?: string;
  productTypeId?: string;
  rating: Rating;
  isFeatured: boolean;
  isFlashSale: boolean;
  isSpecialOffer: boolean;
  status: string;
  attributes?: ProductAttribute[];
  metadata?: Record<string, unknown>;
}

export class CatalogProduct extends AggregateRoot<CatalogProductProps> {
  protected constructor(props: CatalogProductProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: CatalogProductProps, id: string): CatalogProduct {
    return new CatalogProduct(props, id);
  }

  public static create(props: Omit<CatalogProductProps, 'rating' | 'isFeatured' | 'isFlashSale' | 'isSpecialOffer' | 'status'>): CatalogProduct {
    const ratingResult = Rating.create(0);
    const fallbackRating = Object.assign(Object.create(null), { props: { value: 0 } }) as Rating;
    return new CatalogProduct({
      ...props,
      rating: ratingResult.success ? ratingResult.data : fallbackRating,
      isFeatured: false,
      isFlashSale: false,
      isSpecialOffer: false,
      status: 'ACTIVE',
    });
  }

  public updateRating(newValue: number): void {
    const ratingResult = Rating.create(newValue);
    if (ratingResult.success) {
      this.props.rating = ratingResult.data;
      this._updatedAt = new Date();
    }
  }

  get name(): string { return this.props.name; }
  get slug(): Slug { return this.props.slug; }
  get gtin(): GTIN | undefined { return this.props.gtin; }
}
