// apps/backend/src/modules/catalog/application/queries/list-admin-products/list-admin-products.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListAdminProductsQuery } from './list-admin-products.query';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Brand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';

@QueryHandler(ListAdminProductsQuery)
export class ListAdminProductsHandler implements IQueryHandler<ListAdminProductsQuery> {
  async execute(query: ListAdminProductsQuery) {
    const { search, status, page = 1, limit = 50, vendorOnly } = query.filters;
    const vendorId = query.filters.vendorId;
    const categoryId = query.filters.categoryId;
    const skip = Math.max(0, (page - 1) * limit);

    const conditions: Record<string, unknown>[] = [];

    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { gtin: { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (categoryId) {
      conditions.push({ categoryId });
    }

    if (vendorId) {
      conditions.push({ vendorId });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mongoose aggregate pipeline PipelineStage[] gerektiriyor
    const pipeline: Array<Record<string, unknown>> = [];
    if (conditions.length > 0) {
      pipeline.push({ $match: { $and: conditions } });
    } else {
      pipeline.push({ $match: {} });
    }
    
    // Lookup listings first to support filtering by listing status
    pipeline.push(
      {
        $lookup: {
          from: 'listings',
          localField: 'id',
          foreignField: 'catalogProductId',
          as: 'listings'
        }
      }
    );

    if (status) {
      pipeline.push({ $match: { 'listings.status': status } });
    }

    // Clone pipeline for counting before adding lookups that don't affect count
    const countPipeline = [...pipeline, { $count: 'total' }];

    pipeline.push(
      {
        $lookup: {
          from: 'categories',
          let: { catId: '$categoryId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $gt: ['$$catId', null] },
                    { $eq: ['$id', '$$catId'] }
                  ]
                }
              }
            }
          ],
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'product_media',
          localField: 'id',
          foreignField: 'productId',
          as: 'media'
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const [rawItems, countResult] = await Promise.all([
      CatalogProduct.aggregate(pipeline as unknown as Parameters<typeof CatalogProduct.aggregate>[0]).exec(),
      CatalogProduct.aggregate(countPipeline as unknown as Parameters<typeof CatalogProduct.aggregate>[0]).exec(),
    ]);

    const total = countResult[0]?.total || 0;

    const items = rawItems.map((item: Record<string, unknown>) => {
      const listings = item.listings as Record<string, unknown>[] | undefined;
      const listing = listings?.[0] ?? null;
      const totalStock = listings?.reduce((sum: number, l: Record<string, unknown>) => {
        const qty = Number(l.availableQuantity) || Number(l.stock) || 0;
        return sum + qty;
      }, 0) ?? 0;
      const media = item.media as Array<{ url: string }> | undefined;
      return {
        ...item,
        Brand: (item.brands as unknown[])?.[0] || (item.brand ? { name: item.brand } : null),
        Category: item.category ?? null,
        Vendor: (listing as Record<string, unknown> | null)?.vendor ?? null,
        image: media?.[0]?.url ?? null,
        images: media?.map(m => m.url) ?? [],
        price: listing ? Number(listing.price) : 0,
        stock: totalStock,
        sku: listing?.sku ?? '',
        // Görünürlük bayrakları — listing'den alınır (listing öncelikli, fallback catalog product)
        isFeatured:    listing?.isFeatured    ?? item.isFeatured    ?? false,
        isFlashSale:   listing?.isFlashSale   ?? item.isFlashSale   ?? false,
        isSpecialOffer:listing?.isSpecialOffer ?? item.isSpecialOffer ?? false,
        isActive:      listing?.isActive      ?? item.isActive       ?? true,
      };
    });

    return { items, total, page, limit };
  }
}
