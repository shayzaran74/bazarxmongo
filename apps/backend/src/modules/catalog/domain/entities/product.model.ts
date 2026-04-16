// apps/backend/src/modules/catalog/domain/entities/product.model.ts

export type ProductCondition = 'new' | 'used' | 'refurbished';

export interface ProductImage {
  url: string;       // mediaId veya tam URL — MediaService.resolveUrl() çözer
  altText?: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  categoryId: string;
  mainImageUrl: string; // mediaId veya tam URL
  images: ProductImage[];
  sellerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Listing için sadeleştirilmiş projeksiyon — tüm alanları çekmeye gerek yok
export interface ProductListingItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  mainImageUrl: string;
  categoryId: string;
  createdAt: Date;
}
