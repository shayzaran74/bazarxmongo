// apps/backend/src/modules/catalog/application/queries/get-catalog-products/get-catalog-products.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCatalogProductsQuery } from './get-catalog-products.query';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Category } from '@barterborsa/shared-persistence/schemas/backend/category.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { populateDynamicBadges } from '../../helpers/badge-evaluator.helper';

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
      }).select('id _id').exec();

      if (targetCategory) {
        const startId = targetCategory.id || targetCategory._id.toString();
        const allCategoryIds = [startId];
        let currentLevelIds = [startId];
        const visited = new Set<string>([startId]);

        while (currentLevelIds.length > 0) {
          const children = await Category.find({ parentId: { $in: currentLevelIds } }).select('id _id').exec();
          currentLevelIds = [];
          for (const c of children) {
            const cid = c.id || c._id.toString();
            if (!visited.has(cid)) {
              visited.add(cid);
              currentLevelIds.push(cid);
              allCategoryIds.push(cid);
            }
          }
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
      const vendorListings = await Listing.find({ vendorId: query.filters.vendorId }).select('catalogProductId').lean().exec();
      const vendorCatalogIds = vendorListings.map((l: { catalogProductId?: string }) => l.catalogProductId).filter(Boolean);
      filter.id = { $in: vendorCatalogIds };
    } else if (excludeVendorTypes && excludeVendorTypes.length > 0) {
      const excludedVendors = await Vendor.find({ vendorType: { $in: excludeVendorTypes } }).select('id').lean().exec();
      const excludedIds = excludedVendors.map((v: { id?: string }) => v.id).filter(Boolean);
      if (excludedIds.length > 0) {
        const excludedListings = await Listing.find({ vendorId: { $in: excludedIds } }).select('catalogProductId').lean().exec();
        const excludedCatalogIds = excludedListings.map((l: { catalogProductId?: string }) => l.catalogProductId).filter(Boolean);
        if (excludedCatalogIds.length > 0) {
          filter.id = { $nin: excludedCatalogIds };
        }
      }
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

    const productIds = rawItems.map((cp: { id?: string }) => cp.id).filter(Boolean);
    const categoryIds = [...new Set(rawItems.map((cp: { categoryId?: string }) => cp.categoryId).filter(Boolean))];
    
    const [categories, mediaDocs, listings] = await Promise.all([
      Category.find({ id: { $in: categoryIds } }).lean().exec(),
      ProductMedia.find({ productId: { $in: productIds } }).lean().exec(),
      Listing.find({ catalogProductId: { $in: productIds } }).lean().exec()
    ]);

    const vendorIds = [...new Set(listings.map((l: { vendorId?: string }) => l.vendorId).filter(Boolean))];
    const vendors = vendorIds.length 
      ? await Vendor.find({ id: { $in: vendorIds } }).lean().exec()
      : [];
    const vendorMap: Record<string, Record<string, unknown>> = {};
    for (const v of vendors as Record<string, unknown>[]) {
      if (v.id) vendorMap[v.id as string] = v;
    }
    
    const categoryMap: Record<string, Record<string, unknown>> = {};
    for (const cat of categories as Record<string, unknown>[]) {
      if (cat.id) categoryMap[cat.id as string] = cat;
    }
    
    const mediaUrlsMap: Record<string, string[]> = {};
    for (const m of mediaDocs as Record<string, unknown>[]) {
      const productId = m.productId as string;
      if (productId) {
        if (!mediaUrlsMap[productId]) mediaUrlsMap[productId] = [];
        mediaUrlsMap[productId].push(m.url as string);
      }
    }
    
    interface RawItem {
      id: string;
      categoryId?: string;
      rating?: unknown;
      brand?: string;
      brands?: unknown[];
      isFeatured?: boolean;
      isSpecialOffer?: boolean;
      isFlashSale?: boolean;
      [key: string]: unknown;
    }
    
    interface RawListing {
      id: string;
      vendorId: string;
      catalogProductId: string;
      price?: unknown;
      stock?: number;
      sku?: string;
      [key: string]: unknown;
    }

    const listingMap: Record<string, RawListing[]> = {};
    for (const l of listings as unknown as RawListing[]) {
      if (l.catalogProductId) {
        if (!listingMap[l.catalogProductId]) listingMap[l.catalogProductId] = [];
        listingMap[l.catalogProductId].push(l);
      }
    }

    const items = rawItems.map((item: RawItem) => {
      const vendorListings = listingMap[item.id] ?? [];
      const listing = query.filters.vendorId 
        ? (vendorListings.find((l: RawListing) => l.vendorId === query.filters.vendorId) ?? null)
        : (vendorListings[0] ?? null);

      return {
        ...item,
        rating: Number(item.rating) || 0,
        Brand: item.brands?.[0] || (item.brand ? { name: item.brand } : null),
        Category: item.categoryId ? (categoryMap[item.categoryId] ?? null) : null,
        image: mediaUrlsMap[item.id]?.[0] ?? null,
        images: mediaUrlsMap[item.id] ?? [],
        price: listing ? Number(listing.price) : 0,
        listingId: listing?.id ?? null,
        stock: listing?.stock ?? 0,
        sku: listing?.sku ?? '',
        isFeatured: item.isFeatured,
        isSpecialOffer: item.isSpecialOffer,
        isFlashSale: item.isFlashSale,
        userTier: listing ? (vendorMap[listing.vendorId]?.tier || 'CORE') : 'CORE'
      };
    });

    await populateDynamicBadges(items);

    return { items, meta: { total, page, limit } };
  }
}
