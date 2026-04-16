// apps/backend/src/modules/catalog/domain/repositories/product.repository.interface.ts
import { Product, ProductListingItem } from '../entities/product.model';

export const PRODUCT_REPO = 'IProductRepository';

export interface ListingsFilter {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  // id veya slug — GetProductDetails için tek giriş noktası
  findByIdOrSlug(idOrSlug: string): Promise<Product | null>;
  findAll(filter: ListingsFilter): Promise<PaginatedResult<ProductListingItem>>;
}
