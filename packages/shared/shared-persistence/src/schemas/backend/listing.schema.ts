import { Schema, model, Types } from 'mongoose';

export const ListingStatus = ['DRAFT','ACTIVE','INACTIVE','OUT_OF_STOCK','SUSPENDED','REJECTED','ARCHIVED','PENDING'] as const;
export type ListingStatusType = typeof ListingStatus[number];

export const ListingVisibility = ['PUBLIC','PRIVATE','ECOSYSTEM_ONLY','B2B_ONLY'] as const;
export type ListingVisibilityType = typeof ListingVisibility[number];

export const ProductCondition = ['NEW','SECOND_HAND','REFURBISHED','OPEN_BOX'] as const;
export type ProductConditionType = typeof ProductCondition[number];

export interface IListing {
  _id?: string;
  id: string;
  vendorId: string;
  catalogProductId: string;
  title: string;
  description?: string;
  price: Types.Decimal128;
  stock: number;
  status: ListingStatusType;
  visibility: ListingVisibilityType;
  condition: ProductConditionType;
  tags: string[];
  isPromoted: boolean;
  promotedPrice?: Types.Decimal128;
  createdAt: Date;
  updatedAt: Date;
  originalPrice?: Types.Decimal128;
  wholesalePrice?: Types.Decimal128;
  minWholesaleQty?: number;
  sku?: string;
  isDigital: boolean;
  isB2BOnly: boolean;
  b2bDiscount?: Types.Decimal128;
  shippingTemplateId?: string;
  isFeatured: boolean;
  featuredUntil?: Date;
  slug?: string;
  listingType: string;
  isAuctionEnabled: boolean;
  isLotteryEnabled: boolean;
  lastStatusChangedAt?: Date;
  rejectionReason?: string;
  isSpecialOffer: boolean;
  isFlashSale: boolean;
  minMarketPrice?: Types.Decimal128;
  maxPurchasePerMember: number;
  ecosystemId?: string;
  variantOptions?: Record<string, unknown>;
  integrationCode?: string;
  isActive: boolean;
  commissionRate?: Types.Decimal128;
  metadata?: Record<string, unknown>;
  weight: Types.Decimal128;
  volume: Types.Decimal128;
  variants?: Record<string, unknown>;
  availableQuantity: number;
  reservedQuantity: number;
  isSponsored: boolean;
  lowStockThreshold: number;
  sponsorBudget?: Types.Decimal128;
  barcode?: string;
  categoryId?: string;
}

export const ListingSchema = new Schema<IListing>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String, alias: 'vendor_id' },
  catalogProductId: { type: String, alias: 'catalog_product_id', ref: 'CatalogProduct' },
  title: { type: String },
  description: { type: String },
  price: { type: Types.Decimal128 },
  stock: { type: Number, default: 0 },
  status: { type: String, enum: ListingStatus, default: 'ACTIVE' },
  visibility: { type: String, enum: ListingVisibility, default: 'PUBLIC' },
  condition: { type: String, enum: ProductCondition, default: 'NEW' },
  tags: { type: [String], default: [] },
  isPromoted: { type: Boolean, default: false, alias: 'is_promoted' },
  promotedPrice: { type: Types.Decimal128, alias: 'promoted_price' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
  originalPrice: { type: Types.Decimal128, alias: 'original_price' },
  wholesalePrice: { type: Types.Decimal128, alias: 'wholesale_price' },
  minWholesaleQty: { type: Number, alias: 'min_wholesale_qty' },
  sku: { type: String },
  isDigital: { type: Boolean, default: false, alias: 'is_digital' },
  isB2BOnly: { type: Boolean, default: false, alias: 'is_b2b_only' },
  b2bDiscount: { type: Types.Decimal128, alias: 'b2b_discount' },
  shippingTemplateId: { type: String, alias: 'shipping_template_id' },
  isFeatured: { type: Boolean, default: false, alias: 'is_featured' },
  featuredUntil: { type: Date, alias: 'featured_until' },
  slug: { type: String },
  listingType: { type: String, default: 'SELL' },
  isAuctionEnabled: { type: Boolean, default: false, alias: 'is_auction_enabled' },
  isLotteryEnabled: { type: Boolean, default: false, alias: 'is_lottery_enabled' },
  lastStatusChangedAt: { type: Date, alias: 'last_status_changed_at' },
  rejectionReason: { type: String, alias: 'rejection_reason' },
  isSpecialOffer: { type: Boolean, default: false, alias: 'is_special_offer' },
  isFlashSale: { type: Boolean, default: false, alias: 'is_flash_sale' },
  minMarketPrice: { type: Types.Decimal128, alias: 'min_market_price' },
  maxPurchasePerMember: { type: Number, default: 100, alias: 'max_purchase_per_member' },
  ecosystemId: { type: String, alias: 'ecosystem_id' },
  variantOptions: { type: Object, alias: 'variant_options' },
  integrationCode: { type: String, alias: 'integration_code' },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  commissionRate: { type: Types.Decimal128, alias: 'commission_rate' },
  metadata: { type: Object },
  weight: { type: Types.Decimal128, default: 0 },
  volume: { type: Types.Decimal128, default: 0 },
  variants: { type: Object },
  availableQuantity: { type: Number, default: 0, alias: 'available_quantity' },
  reservedQuantity: { type: Number, default: 0, alias: 'reserved_quantity' },
  isSponsored: { type: Boolean, default: false, alias: 'is_sponsored' },
  lowStockThreshold: { type: Number, default: 5, alias: 'low_stock_threshold' },
  sponsorBudget: { type: Types.Decimal128, default: 0, alias: 'sponsor_budget' },
  barcode: { type: String },
  categoryId: { type: String, alias: 'category_id' },
}, {
  timestamps: true,
  collection: 'listings',
});

ListingSchema.index({ vendorId: 1 });
ListingSchema.index({ catalogProductId: 1 });
ListingSchema.index({ slug: 1 });
ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ categoryId: 1, status: 1 });
ListingSchema.index({ ecosystemId: 1, isActive: 1 });

export const Listing = model<IListing>('Listing', ListingSchema);