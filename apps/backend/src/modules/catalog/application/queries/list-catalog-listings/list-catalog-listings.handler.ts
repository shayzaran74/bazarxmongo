// apps/backend/src/modules/catalog/application/queries/list-catalog-listings/list-catalog-listings.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListCatalogListingsQuery } from './list-catalog-listings.query';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { Company } from '@barterborsa/shared-persistence/schemas/backend/company.schema';

@QueryHandler(ListCatalogListingsQuery)
export class ListCatalogListingsHandler implements IQueryHandler<ListCatalogListingsQuery> {
  async execute(query: ListCatalogListingsQuery) {
    try {
      const { userId, userRole, filters } = query;
    const { search, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    const roles = Array.isArray(userRole) ? userRole : (userRole ? [userRole] : []);
    const isAdmin = roles.some(r => ['ADMIN', 'SUPER_ADMIN'].includes(r));
    const isVendor = roles.includes('VENDOR');
    const isVendorScope = filters.scope === 'vendor';

    if (!isAdmin && !isVendorScope) {
      filter.status = 'ACTIVE';
    }

    if (isAdmin) {
      // admin tümünü görür
    } else if (isVendor && userId) {
      const vendor = await Vendor.findOne({ userId }).exec();
      if (vendor) {
        filter.vendorId = vendor.id;
      } else {
        return { items: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      }
    } else if (!isVendorScope) {
      filter.status = 'ACTIVE';
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (filters.vendorType) {
      filter.vendorType = filters.vendorType;
    }

    const [items, total] = await Promise.all([
      Listing.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean().exec(),
      Listing.countDocuments(filter).exec(),
    ]);

    const catalogProductIds = [...new Set(items.map((l: any) => l.catalogProductId).filter(Boolean))];
    const vendorIds        = [...new Set(items.map((l: any) => l.vendorId).filter(Boolean))];

    const { CatalogProduct } = require('@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema');
    const { ProductMedia } = require('@barterborsa/shared-persistence/schemas/backend/productMedia.schema');
    
    const catalogProducts: Record<string, any> = {};
    const mediaMap: Record<string, string[]> = {};
    
    if (catalogProductIds.length) {
      const [cps, mediaDocs] = await Promise.all([
        CatalogProduct.find({ id: { $in: catalogProductIds } }).lean().exec(),
        ProductMedia.find({ productId: { $in: catalogProductIds } }).lean().exec()
      ]);
      
      for (const cp of cps) catalogProducts[cp.id] = cp;
      for (const m of mediaDocs) {
        if (!mediaMap[m.productId]) mediaMap[m.productId] = [];
        mediaMap[m.productId].push(m.url);
      }
    }

    const vendors: Record<string, any> = {};
    if (vendorIds.length) {
      const vs = await Vendor.find({ id: { $in: vendorIds } }).lean().exec();
      const companyIds = vs.map((v: any) => v.companyId).filter(Boolean);
      const companies: Record<string, any> = {};
      if (companyIds.length) {
        const cs = await Company.find({ id: { $in: companyIds } }).lean().exec();
        for (const c of cs) companies[c.id] = c;
      }
      for (const v of vs) {
        vendors[v.id] = { ...v, company: companies[v.companyId] };
      }
    }

    const mappedItems = items.map((l: any) => ({
      id: l.id,
      name: l.title,
      price: l.price ? Number(l.price) : 0,
      stock: l.stock,
      sku: l.sku || '',
      barcode: l.barcode || '',
      status: l.status,
      images: mediaMap[l.catalogProductId] || [],
      category: catalogProducts[l.catalogProductId]?.categoryId || null,
      vendorName: vendors[l.vendorId]?.company?.name || 'Bilinmeyen Satıcı',
      catalogProduct: catalogProducts[l.catalogProductId] || null,
    }));

    return {
      items: mappedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    } catch (error) {
      console.error('ListCatalogListingsHandler error:', error);
      throw error;
    }
  }
}
