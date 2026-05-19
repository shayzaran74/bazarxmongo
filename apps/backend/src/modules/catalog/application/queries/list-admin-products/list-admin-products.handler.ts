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

    const pipeline: any[] = [];
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
      CatalogProduct.aggregate(pipeline).exec(),
      CatalogProduct.aggregate(countPipeline).exec(),
    ]);

    const total = countResult[0]?.total || 0;

    const items = rawItems.map((item: any) => {
      const listing = item.listings?.[0] ?? null;
      const totalStock = item.listings?.reduce((sum: number, l: any) => {
        const qty = Number(l.availableQuantity) || Number(l.stock) || 0;
        return sum + qty;
      }, 0) ?? 0;
      return {
        ...item,
        Brand: item.brands?.[0] || (item.brand ? { name: item.brand } : null),
        Category: item.category ?? null,
        Vendor: listing?.vendor ?? null,
        image: item.media?.[0]?.url ?? null,
        images: item.media?.map((m: any) => m.url) ?? [],
        price: listing ? Number(listing.price) : 0,
        stock: totalStock,
        sku: listing?.sku ?? ''
      };
    });

    return { items, total, page, limit };
  }
}
