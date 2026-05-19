import { Schema, model, Types } from 'mongoose';

export interface ICatalogProduct {
  _id?: string;
  id: string;
  gtin?: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  specs?: Record<string, unknown>;
  categoryId?: string;
  productTypeId?: string;
  createdAt: Date;
  updatedAt: Date;
  rating: Types.Decimal128;
  isFeatured: boolean;
  modelId?: string;
  attributes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  sourceUrl?: string;
  scrapedAt?: Date;
  isFlashSale: boolean;
  status: string;
  isSpecialOffer: boolean;
}

export const CatalogProductSchema = new Schema<ICatalogProduct>({
  _id: { type: String },
  id: { type: String, required: true },
  gtin: { type: String },
  name: { type: String },
  slug: { type: String },
  brand: { type: String },
  description: { type: String },
  specs: { type: Object },
  categoryId: { type: String, alias: 'category_id' },
  productTypeId: { type: String, alias: 'product_type_id' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
  rating: { type: Types.Decimal128, default: 0 },
  isFeatured: { type: Boolean, default: false, alias: 'is_featured' },
  modelId: { type: String, alias: 'model_id' },
  attributes: { type: Object },
  metadata: { type: Object },
  sourceUrl: { type: String, alias: 'source_url' },
  scrapedAt: { type: Date, alias: 'scraped_at' },
  isFlashSale: { type: Boolean, default: false, alias: 'is_flash_sale' },
  status: { type: String, default: 'ACTIVE' },
  isSpecialOffer: { type: Boolean, default: false, alias: 'is_special_offer' },
}, {
  timestamps: true,
  collection: 'catalog_products',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

CatalogProductSchema.virtual('media', {
  ref: 'ProductMedia',
  localField: 'id',
  foreignField: 'productId',
});

CatalogProductSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: 'id',
  justOne: true,
});

CatalogProductSchema.virtual('listings', {
  ref: 'Listing',
  localField: 'id',
  foreignField: 'catalogProductId',
});

CatalogProductSchema.virtual('brands', {
  ref: 'Brand',
  localField: 'brand',
  foreignField: 'name',
});

CatalogProductSchema.index({ categoryId: 1 });

export const CatalogProduct = model<ICatalogProduct>('CatalogProduct', CatalogProductSchema);