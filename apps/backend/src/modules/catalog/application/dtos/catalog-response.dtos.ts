// apps/backend/src/modules/catalog/application/dtos/catalog-response.dtos.ts

// ProductCondition artık product.model.ts'den gelmiyor — inline tanım
export type ProductCondition = 'new' | 'used' | 'refurbished';

// ---- GetProductDetails DTO ----

export interface ProductImageDto {
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface ProductDetailsDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  categoryId: string;
  mainImage: string;
  thumbnail: string;
  gallery: ProductImageDto[];
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---- GetListings / GetProductBySlug DTO ----

export interface ProductListingItemDto {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  thumbnail: string;
  categoryId: string;
  createdAt: Date;
}

export interface PaginatedListingsDto {
  items: ProductListingItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
