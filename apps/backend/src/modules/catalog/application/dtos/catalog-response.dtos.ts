// apps/backend/src/modules/catalog/application/dtos/catalog-response.dtos.ts
import { ProductCondition } from '../../domain/entities/product.model';

// ---- GetProductDetails DTO ----

export interface ProductImageDto {
  url: string;       // çözümlenmiş URL (MediaService'ten gelir)
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
  mainImage: string;   // 'medium' boyutlu, çözümlenmiş URL
  thumbnail: string;   // 'thumb' boyutlu, çözümlenmiş URL
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
  thumbnail: string;   // 'thumb' boyutlu, çözümlenmiş URL
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
