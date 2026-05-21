// apps/backend/src/modules/catalog/infrastructure/persistence/mappers/catalog-product.mapper.ts
// CatalogProductMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { ICatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { CatalogProduct, CatalogProductProps, ProductSpec, ProductAttribute } from '../../../domain/entities/catalog-product.entity';
import { Slug } from '../../../domain/value-objects/slug.vo';
import { GTIN } from '../../../domain/value-objects/gtin.vo';
import { Rating } from '../../../domain/value-objects/rating.vo';

export interface CatalogProductDocument extends ICatalogProduct {
  _id?: string;
}

export class CatalogProductMapper {
  public static toDomain(doc: CatalogProductDocument): CatalogProduct {
    const slugResult = Slug.create(doc.slug);
    const gtinResult = GTIN.create(doc.gtin);
    const ratingResult = doc.rating ? Rating.create(Number(doc.rating.toString())) : Rating.create(0);
    const defaultRating = Rating.create(0);

    const props: CatalogProductProps = {
      name: doc.name,
      slug: slugResult.success ? slugResult.data : Slug.fromText(doc.slug),
      gtin: gtinResult.success ? gtinResult.data : undefined,
      brand: doc.brand,
      description: doc.description,
      specs: doc.specs as ProductSpec | undefined,
      categoryId: doc.categoryId ?? undefined,
      modelId: doc.modelId ?? undefined,
      productTypeId: doc.productTypeId ?? undefined,
      rating: ratingResult.success ? ratingResult.data : (defaultRating.success ? defaultRating.data : (null as unknown as never)),
      isFeatured: doc.isFeatured,
      isFlashSale: doc.isFlashSale,
      isSpecialOffer: doc.isSpecialOffer,
      status: doc.status,
      attributes: doc.attributes as unknown as ProductAttribute[] | undefined,
      metadata: doc.metadata as Record<string, unknown> | undefined,
    };

    return CatalogProduct.fromPersistence(props, doc.id);
  }

  public static toPersistence(domain: CatalogProduct): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      name: props.name,
      slug: props.slug.value,
      gtin: props.gtin?.value,
      brand: props.brand,
      description: props.description,
      specs: props.specs,
      categoryId: props.categoryId,
      modelId: props.modelId,
      productTypeId: props.productTypeId,
      rating: props.rating?.value ?? 0,
      isFeatured: props.isFeatured,
      isFlashSale: props.isFlashSale,
      isSpecialOffer: props.isSpecialOffer,
      status: props.status,
      attributes: props.attributes,
      metadata: props.metadata,
    };
  }
}