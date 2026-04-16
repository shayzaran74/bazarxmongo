// apps/backend/src/modules/catalog/infrastructure/persistence/prisma-product.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { 
  IProductRepository, 
  ListingsFilter, 
  PaginatedResult 
} from '../../domain/repositories/product.repository.interface';
import { Product, ProductListingItem } from '../../domain/entities/product.model';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const data = await this.prisma.catalogProduct.findUnique({
      where: { id },
      include: { media: { orderBy: { sortOrder: 'asc' } } }
    });

    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const data = await this.prisma.catalogProduct.findUnique({
      where: { slug },
      include: { media: { orderBy: { sortOrder: 'asc' } } }
    });

    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Product | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    const data = await this.prisma.catalogProduct.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: { media: { orderBy: { sortOrder: 'asc' } } }
    });

    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findAll(filter: ListingsFilter): Promise<PaginatedResult<ProductListingItem>> {
    const { categoryId, minPrice, maxPrice, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE' }; // isActive yerine status
    if (categoryId) where.categoryId = categoryId;
    
    // Not: CatalogProduct'ta price alanı yoksa şimdilik fiyat filtresini atlıyoruz.
    // İleride 'Listing' tablosuyla join yapılarak bu eklenebilir.

    const [items, total] = await Promise.all([
      this.prisma.catalogProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { media: { take: 1, orderBy: { sortOrder: 'asc' } } }
      }),
      this.prisma.catalogProduct.count({ where })
    ]);

    return {
      items: items.map(this.mapToListingItem),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // --- Mappers ---

  private mapToDomain(db: any): Product {
    return {
      id: db.id,
      slug: db.slug,
      title: db.name,
      description: db.description || '',
      price: 0, // CatalogProduct şablon üründür, liste fiyatı Listing'de olur.
      currency: 'TRY',
      condition: 'new',
      categoryId: db.categoryId || '',
      mainImageUrl: db.media[0]?.url || '',
      images: db.media.map((m: any) => ({
        url: m.url,
        altText: db.name,
        isPrimary: m.sortOrder === 0
      })),
      sellerId: '', 
      isActive: db.status === 'ACTIVE',
      createdAt: db.createdAt,
      updatedAt: db.updatedAt
    };
  }

  private mapToListingItem(db: any): ProductListingItem {
    return {
      id: db.id,
      slug: db.slug,
      title: db.name,
      price: 0,
      currency: 'TRY',
      condition: 'new',
      mainImageUrl: db.media[0]?.url || '',
      categoryId: db.categoryId || '',
      createdAt: db.createdAt
    };
  }
}
