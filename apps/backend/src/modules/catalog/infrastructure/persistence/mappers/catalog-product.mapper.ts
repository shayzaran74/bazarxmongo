// apps/backend/src/modules/catalog/infrastructure/persistence/mappers/catalog-product.mapper.ts

import { CatalogProduct, CatalogProductProps } from '../../../domain/entities/catalog-product.entity';
import { Slug } from '../../../domain/value-objects/slug.vo';
import { GTIN } from '../../../domain/value-objects/gtin.vo';
import { Rating } from '../../../domain/value-objects/rating.vo';
import { CatalogProduct as PrismaProduct } from '@prisma/client';

export class CatalogProductMapper {
  public static toDomain(record: PrismaProduct): CatalogProduct {
    const slugResult = Slug.create(record.slug);
    const gtinResult = GTIN.create(record.gtin);
    const ratingResult = Rating.create(Number(record.rating));
    const defaultRating = Rating.create(0);
    
    const props: CatalogProductProps = {
      name: record.name,
      slug: slugResult.success ? slugResult.data : Slug.fromText(record.slug),
      gtin: gtinResult.success ? gtinResult.data : undefined,
      brand: record.brand,
      description: record.description,
      specs: record.specs,
      categoryId: record.categoryId || undefined,
      modelId: record.modelId || undefined,
      productTypeId: record.productTypeId || undefined,
      rating: ratingResult.success ? ratingResult.data : (defaultRating.success ? defaultRating.data : null as any),
      isFeatured: record.isFeatured,
      isFlashSale: record.isFlashSale,
      isSpecialOffer: record.isSpecialOffer,
      status: record.status,
      attributes: record.attributes,
      metadata: record.metadata,
    };

    return CatalogProduct.fromPersistence(props, record.id);
  }

  public static toPersistence(domain: CatalogProduct): any {
    const props = domain.getProps();
    
    return {
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
      rating: props.rating.value,
      isFeatured: props.isFeatured,
      isFlashSale: props.isFlashSale,
      isSpecialOffer: props.isSpecialOffer,
      status: props.status,
      attributes: props.attributes,
      metadata: props.metadata,
      updatedAt: new Date(),
    };
  }
}
