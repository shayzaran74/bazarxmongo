// apps/backend/src/modules/catalog/infrastructure/persistence/mappers/listing.mapper.ts

import { Listing, ListingProps } from '../../../domain/entities/listing.entity';
import { Slug } from '../../../domain/value-objects/slug.vo';
import { Price } from '../../../domain/value-objects/price.vo';
import { ListingStatus } from '../../../domain/enums/listing-status.enum';
import { ListingVisibility } from '../../../domain/enums/listing-visibility.enum';
import { ProductCondition } from '../../../domain/enums/product-condition.enum';
import { Listing as PrismaListing } from '@prisma/client';

export class ListingMapper {
  public static toDomain(record: PrismaListing): Listing {
    const slugResult = Slug.create(record.slug || '');
    const priceResult = Price.create(record.price);
    const zeroPrice = Price.create('0');
    const promotedPriceResult = record.promotedPrice ? Price.create(record.promotedPrice) : null;
    const originalPriceResult = record.originalPrice ? Price.create(record.originalPrice) : null;
    const wholesalePriceResult = record.wholesalePrice ? Price.create(record.wholesalePrice) : null;
    
    const props: ListingProps = {
      vendorId: record.vendorId,
      catalogProductId: record.catalogProductId,
      title: record.title,
      description: record.description || undefined,
      price: priceResult.success ? priceResult.data : (zeroPrice.success ? zeroPrice.data : null as any),
      stock: record.stock,
      status: record.status as ListingStatus,
      visibility: record.visibility as ListingVisibility,
      condition: record.condition as ProductCondition,
      slug: slugResult.success ? slugResult.data : Slug.fromText(record.slug || ''),
      sku: record.sku || undefined,
      isPromoted: record.isPromoted,
      promotedPrice: promotedPriceResult?.success ? promotedPriceResult.data : undefined,
      originalPrice: originalPriceResult?.success ? originalPriceResult.data : undefined,
      wholesalePrice: wholesalePriceResult?.success ? wholesalePriceResult.data : undefined,
      minWholesaleQty: record.minWholesaleQty || undefined,
      isDigital: record.isDigital,
      isB2BOnly: record.isB2BOnly,
      b2bDiscount: record.b2bDiscount ? Number(record.b2bDiscount) : undefined,
      tags: record.tags,
      isFeatured: record.isFeatured,
      featuredUntil: record.featuredUntil || undefined,
      listingType: record.listingType,
      isAuctionEnabled: record.isAuctionEnabled,
      isLotteryEnabled: record.isLotteryEnabled,
      ecosystemId: record.ecosystemId || undefined,
      commissionRate: record.commissionRate ? Number(record.commissionRate) : undefined,
      variants: record.variants,
      metadata: record.metadata,
      availableQuantity: record.availableQuantity,
      reservedQuantity: record.reservedQuantity,
    };

    return Listing.fromPersistence(props, record.id);
  }

  public static toPersistence(domain: Listing): any {
    const props = domain.getProps();
    
    return {
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
      updatedAt: new Date(),
    };
  }
}
