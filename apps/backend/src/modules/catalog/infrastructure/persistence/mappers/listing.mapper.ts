// apps/backend/src/modules/catalog/infrastructure/persistence/mappers/listing.mapper.ts
// ListingMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { IListing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Listing, ListingProps } from '../../../domain/entities/listing.entity';
import { Slug } from '../../../domain/value-objects/slug.vo';
import { Price } from '../../../domain/value-objects/price.vo';
import { ListingStatus } from '../../../domain/enums/listing-status.enum';
import { ListingVisibility } from '../../../domain/enums/listing-visibility.enum';
import { ProductCondition } from '../../../domain/enums/product-condition.enum';

export interface ListingDocument extends IListing {
  _id?: string;
}

export class ListingMapper {
  public static toDomain(doc: ListingDocument): Listing {
    const slugResult = Slug.create(doc.slug || '');
    const priceResult = Price.create(doc.price?.toString() || '0');
    const zeroPrice = Price.create('0');

    const props: ListingProps = {
      vendorId: doc.vendorId,
      catalogProductId: doc.catalogProductId,
      title: doc.title,
      description: doc.description ?? undefined,
      price: (priceResult.success ? priceResult.data : zeroPrice.data) as Price,
      stock: doc.stock,
      status: doc.status as ListingStatus,
      visibility: doc.visibility as ListingVisibility,
      condition: doc.condition as ProductCondition,
      slug: slugResult.success ? slugResult.data : Slug.fromText(doc.slug || ''),
      sku: doc.sku ?? undefined,
      isPromoted: doc.isPromoted,
      promotedPrice: (() => {
        if (!doc.promotedPrice) return undefined;
        const r = Price.create(doc.promotedPrice.toString());
        return r.success ? r.data : undefined;
      })(),
      originalPrice: (() => {
        if (!doc.originalPrice) return undefined;
        const r = Price.create(doc.originalPrice.toString());
        return r.success ? r.data : undefined;
      })(),
      wholesalePrice: (() => {
        if (!doc.wholesalePrice) return undefined;
        const r = Price.create(doc.wholesalePrice.toString());
        return r.success ? r.data : undefined;
      })(),
      minWholesaleQty: doc.minWholesaleQty ?? undefined,
      isDigital: doc.isDigital,
      isB2BOnly: doc.isB2BOnly,
      b2bDiscount: doc.b2bDiscount ? Number(doc.b2bDiscount.toString()) : undefined,
      tags: doc.tags,
      isFeatured: doc.isFeatured,
      featuredUntil: doc.featuredUntil ?? undefined,
      listingType: doc.listingType,
      isAuctionEnabled: doc.isAuctionEnabled,
      isLotteryEnabled: doc.isLotteryEnabled,
      ecosystemId: doc.ecosystemId ?? undefined,
      commissionRate: doc.commissionRate ? Number(doc.commissionRate.toString()) : undefined,
      variants: doc.variants as Record<string, unknown> | undefined,
      metadata: doc.metadata as Record<string, unknown> | undefined,
      availableQuantity: doc.availableQuantity,
      reservedQuantity: doc.reservedQuantity,
    };

    return Listing.fromPersistence(props, doc.id);
  }

  public static toPersistence(domain: Listing): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      vendorId: props.vendorId,
      catalogProductId: props.catalogProductId,
      title: props.title,
      description: props.description,
      price: props.price.amount,
      stock: props.stock,
      status: props.status,
      visibility: props.visibility,
      condition: props.condition,
      slug: props.slug.value,
      sku: props.sku,
      isPromoted: props.isPromoted,
      promotedPrice: props.promotedPrice?.amount,
      originalPrice: props.originalPrice?.amount,
      wholesalePrice: props.wholesalePrice?.amount,
      minWholesaleQty: props.minWholesaleQty,
      isDigital: props.isDigital,
      isB2BOnly: props.isB2BOnly,
      b2bDiscount: props.b2bDiscount,
      tags: props.tags,
      isFeatured: props.isFeatured,
      featuredUntil: props.featuredUntil,
      listingType: props.listingType,
      isAuctionEnabled: props.isAuctionEnabled,
      isLotteryEnabled: props.isLotteryEnabled,
      ecosystemId: props.ecosystemId,
      commissionRate: props.commissionRate,
      variants: props.variants,
      metadata: props.metadata,
      availableQuantity: props.availableQuantity,
      reservedQuantity: props.reservedQuantity,
    };
  }
}