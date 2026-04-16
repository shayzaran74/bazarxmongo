// apps/backend/src/modules/catalog/domain/entities/listing.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Slug } from '../value-objects/slug.vo';
import { Price } from '../value-objects/price.vo';
import { ListingStatus } from '../enums/listing-status.enum';
import { ListingVisibility } from '../enums/listing-visibility.enum';
import { ProductCondition } from '../enums/product-condition.enum';

export interface ListingProps {
  vendorId: string;
  catalogProductId: string;
  title: string;
  description?: string;
  price: Price;
  stock: number;
  status: ListingStatus;
  visibility: ListingVisibility;
  condition: ProductCondition;
  slug: Slug;
  sku?: string;
  isPromoted: boolean;
  promotedPrice?: Price;
  originalPrice?: Price;
  wholesalePrice?: Price;
  minWholesaleQty?: number;
  isDigital: boolean;
  isB2BOnly: boolean;
  b2bDiscount?: number;
  tags: string[];
  isFeatured: boolean;
  featuredUntil?: Date;
  listingType: string; // SELL, BUY, RENT
  isAuctionEnabled: boolean;
  isLotteryEnabled: boolean;
  ecosystemId?: string;
  commissionRate?: number;
  variants?: any;
  metadata?: any;
  availableQuantity: number;
  reservedQuantity: number;
}

export class Listing extends AggregateRoot<ListingProps> {
  protected constructor(props: ListingProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: ListingProps, id: string): Listing {
    return new Listing(props, id);
  }

  public static create(props: Omit<ListingProps, 'status' | 'isPromoted' | 'isFeatured' | 'availableQuantity' | 'reservedQuantity'>): Listing {
    return new Listing({
      ...props,
      status: ListingStatus.ACTIVE,
      isPromoted: false,
      isFeatured: false,
      availableQuantity: props.stock,
      reservedQuantity: 0,
    });
  }

  public updatePrice(newPrice: Price): void {
    if (!this.props.price.equals(newPrice)) {
      this.props.originalPrice = this.props.price;
      this.props.price = newPrice;
      this._updatedAt = new Date();
      // Price history record would be handled in the side effect / domain service
    }
  }

  public updateStock(newStock: number): void {
    const diff = newStock - this.props.stock;
    this.props.stock = newStock;
    this.props.availableQuantity += diff;
    
    if (this.props.availableQuantity <= 0) {
      this.props.status = ListingStatus.OUT_OF_STOCK;
    } else if (this.props.status === ListingStatus.OUT_OF_STOCK) {
      this.props.status = ListingStatus.ACTIVE;
    }
    
    this._updatedAt = new Date();
  }

  public reserveStock(quantity: number): boolean {
    if (this.props.availableQuantity < quantity) {
      return false;
    }
    this.props.availableQuantity -= quantity;
    this.props.reservedQuantity += quantity;
    this._updatedAt = new Date();
    return true;
  }

  get vendorId(): string { return this.props.vendorId; }
  get catalogProductId(): string { return this.props.catalogProductId; }
  get price(): Price { return this.props.price; }
  get stock(): number { return this.props.stock; }
  get status(): ListingStatus { return this.props.status; }
  get slug(): Slug { return this.props.slug; }
}
