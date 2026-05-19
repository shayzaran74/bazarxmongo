// apps/backend/src/modules/catalog/application/queries/get-catalog-products/get-catalog-products.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCatalogProductsQuery } from './get-catalog-products.query';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Category } from '@barterborsa/shared-persistence/schemas/backend/category.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';

@QueryHandler(GetCatalogProductsQuery)
export class GetCatalogProductsHandler implements IQueryHandler<GetCatalogProductsQuery> {
  async execute(query: GetCatalogProductsQuery) {
    const {
      search, categoryId,
      isFeatured, isSpecialOffer, isFlashSale,
      vendorType, excludeVendorTypes,
      page = 1, limit = 48
    } = query.filters;

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { status: 'ACTIVE' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (categoryId) {
      const targetCategory = await Category.findOne({
        $or: [{ id: categoryId }, { slug: categoryId }]
      }).select('id').exec();

      if (targetCategory) {
        const allCategoryIds = [targetCategory.id];
        let currentLevelIds = [targetCategory.id];

        while (currentLevelIds.length > 0) {
          const children = await Category.find({ parentId: { $in: currentLevelIds } }).select('id').exec();
          currentLevelIds = children.map((c: any) => c.id);
          allCategoryIds.push(...currentLevelIds);
        }

        filter.categoryId = { $in: allCategoryIds };
      } else {
        filter.categoryId = categoryId;
      }
    }
    if (query.filters.brandId) {
      filter.brandId = query.filters.brandId;
    }
    if (query.filters.minPrice !== undefined || query.filters.maxPrice !== undefined) {
      const priceFilter: Record<string, unknown> = { status: 'ACTIVE' };
      if (query.filters.minPrice !== undefined) priceFilter.$gte = Number(query.filters.minPrice);
      if (query.filters.maxPrice !== undefined) priceFilter.$lte = Number(query.filters.maxPrice);
      filter.price = priceFilter;
    }

    if (isFeatured === true) filter.isFeatured = true;
    if (isSpecialOffer === true) filter.isSpecialOffer = true;
    if (isFlashSale === true) filter.isFlashSale = true;
    if (query.filters.vendorId) {
      filter.vendorId = query.filters.vendorId;
    }

    const [rawItems, total] = await Promise.all([
      CatalogProduct.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      CatalogProduct.countDocuments(filter).exec(),
    ]);

    const productIds = rawItems.map((cp: any) => cp.id).filter(Boolean);
    const categoryIds = [...new Set(rawItems.map((cp: any) => cp.categoryId).filter(Boolean))];
    
    const [categories, mediaDocs, listings] = await Promise.all([
      Category.find({ id: { $in: categoryIds } }).lean().exec(),
      ProductMedia.find({ productId: { $in: productIds } }).lean().exec(),
      Listing.find({ catalogProductId: { $in: productIds } }).lean().exec()
    ]);
    
    const categoryMap: Record<string, any> = {};
    for (const cat of categories) categoryMap[cat.id] = cat;
    
    const mediaUrlsMap: Record<string, string[]> = {};
    for (const m of mediaDocs) {
      if (!mediaUrlsMap[m.productId]) mediaUrlsMap[m.productId] = [];
      mediaUrlsMap[m.productId].push(m.url);
    }
    
    const listingMap: Record<string, any[]> = {};
    for (const l of listings) {
      if (!listingMap[l.catalogProductId]) listingMap[l.catalogProductId] = [];
      listingMap[l.catalogProductId].push(l);
    }

    const items = rawItems.map((item: any) => {
      const listing = listingMap[item.id]?.[0] ?? null;
      return {
        ...item,
        rating: Number(item.rating) || 0,
        Brand: item.brands?.[0] || (item.brand ? { name: item.brand } : null),
        Category: categoryMap[item.categoryId] ?? null,
        image: mediaUrlsMap[item.id]?.[0] ?? null,
        images: mediaUrlsMap[item.id] ?? [],
        price: listing ? Number(listing.price) : 0,
        listingId: listing?.id ?? null,
        stock: listing?.stock ?? 0,
        sku: listing?.sku ?? '',
        isFeatured: item.isFeatured,
        isSpecialOffer: item.isSpecialOffer,
        isFlashSale: item.isFlashSale
      };
    });

    return { items, meta: { total, page, limit } };
  }
}
