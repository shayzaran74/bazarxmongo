// apps/backend/src/modules/catalog/infrastructure/persistence/product.repository.stub.ts

import { Injectable } from '@nestjs/common';
import {
  IProductRepository,
  ListingsFilter,
  PaginatedResult,
} from '../../domain/repositories/product.repository.interface';
import { Product, ProductListingItem } from '../../domain/entities/product.model';

const STUB_PRODUCTS: Product[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    slug: 'iphone-14-pro-ikinci-el',
    title: 'iPhone 14 Pro — İkinci El',
    description: 'Mükemmel kondisyonda, kutusu ve aksesuarları tam.',
    price: 42000,
    currency: 'TRY',
    condition: 'used',
    categoryId: 'cat-elektronik',
    mainImageUrl: 'products/stub-iphone.jpg', // LocalStorageAdapter path formatı
    images: [
      { url: 'products/stub-iphone.jpg', altText: 'Ön yüz', isPrimary: true },
      { url: 'products/stub-iphone-2.jpg', altText: 'Arka yüz', isPrimary: false },
    ],
    sellerId: 'seller-001',
    isActive: true,
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-15'),
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    slug: 'macbook-pro-m3-sifir',
    title: 'MacBook Pro M3 — Sıfır',
    description: 'Faturalı, garantili. Space Gray.',
    price: 89000,
    currency: 'TRY',
    condition: 'new',
    categoryId: 'cat-elektronik',
    mainImageUrl: 'products/stub-macbook.jpg',
    images: [
      { url: 'products/stub-macbook.jpg', altText: 'Üst kapak', isPrimary: true },
    ],
    sellerId: 'seller-002',
    isActive: true,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
];

@Injectable()
export class ProductRepositoryStub implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    return STUB_PRODUCTS.find((p) => p.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return STUB_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Product | null> {
    // UUID formatıysa id ile, değilse slug ile ara
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );
    return isUuid ? this.findById(idOrSlug) : this.findBySlug(idOrSlug);
  }

  async findAll(
    filter: ListingsFilter,
  ): Promise<PaginatedResult<ProductListingItem>> {
    let results = STUB_PRODUCTS.filter((p) => p.isActive);

    if (filter.categoryId) {
      results = results.filter((p) => p.categoryId === filter.categoryId);
    }
    if (filter.minPrice !== undefined) {
      results = results.filter((p) => p.price >= filter.minPrice!);
    }
    if (filter.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= filter.maxPrice!);
    }

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const total = results.length;
    const items = results.slice((page - 1) * limit, page * limit).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: p.price,
      currency: p.currency,
      condition: p.condition,
      mainImageUrl: p.mainImageUrl,
      categoryId: p.categoryId,
      createdAt: p.createdAt,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
