// apps/backend/src/modules/catalog/domain/entities/listing.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { Slug } from '../value-objects/slug.vo';
import { Price } from '../value-objects/price.vo';
import { ListingStatus } from '../enums/listing-status.enum';
import { ListingVisibility } from '../enums/listing-visibility.enum';
import { ProductCondition } from '../enums/product-condition.enum';

// Master Plan v4.3 §4.2 — Fabrika ürün gamı bayi görünürlük türü
export enum DealerVisibility {
  ALL_DEALERS = 'ALL_DEALERS',
  SELECTED_DEALERS = 'SELECTED_DEALERS',
  NONE = 'NONE',
}

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
  metadata?: Record<string, unknown>;
  availableQuantity: number;
  reservedQuantity: number;
  // Master Plan v4.3 §4.2 — Fabrika ekosistemi ürün gamı kontrolleri
  visibleTo?: DealerVisibility;
  selectedDealerIds?: string[];
  availableFrom?: Date;
  availableTo?: Date;
  allowOnlineResale?: boolean;
  maxOrderQtyPerDealer?: number;
}

export class Listing extends AggregateRoot<ListingProps> {
  protected constructor(props: ListingProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: ListingProps, id: string): Listing {
    return new Listing(props, id);
  }

  public static create(props: Omit<ListingProps, 'status' | 'isPromoted' | 'isFeatured' | 'availableQuantity' | 'reservedQuantity'>): Listing {
    // Master Plan §4.2 — Ekosistem listing'inde maxOrderQtyPerDealer zorunlu
    if (props.ecosystemId && (props.maxOrderQtyPerDealer === undefined || props.maxOrderQtyPerDealer === null)) {
      throw new Error('ECOSYSTEM_LISTING_REQUIRES_MAX_ORDER_QTY_PER_DEALER');
    }
    if (props.visibleTo === DealerVisibility.SELECTED_DEALERS && (!props.selectedDealerIds || props.selectedDealerIds.length === 0)) {
      throw new Error('SELECTED_DEALERS_REQUIRES_DEALER_IDS');
    }
    if (props.availableFrom && props.availableTo && props.availableFrom >= props.availableTo) {
      throw new Error('AVAILABLE_FROM_MUST_BE_BEFORE_AVAILABLE_TO');
    }
    return new Listing({
      ...props,
      status: ListingStatus.ACTIVE,
      isPromoted: false,
      isFeatured: false,
      availableQuantity: props.stock,
      reservedQuantity: 0,
      visibleTo: props.visibleTo ?? DealerVisibility.NONE,
      allowOnlineResale: props.allowOnlineResale ?? false,
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
  get ecosystemId(): string | undefined { return this.props.ecosystemId; }
  get visibleTo(): DealerVisibility { return this.props.visibleTo ?? DealerVisibility.NONE; }
  get selectedDealerIds(): string[] { return this.props.selectedDealerIds ?? []; }
  get availableFrom(): Date | undefined { return this.props.availableFrom; }
  get availableTo(): Date | undefined { return this.props.availableTo; }
  get allowOnlineResale(): boolean { return this.props.allowOnlineResale ?? false; }
  get maxOrderQtyPerDealer(): number | undefined { return this.props.maxOrderQtyPerDealer; }
}
