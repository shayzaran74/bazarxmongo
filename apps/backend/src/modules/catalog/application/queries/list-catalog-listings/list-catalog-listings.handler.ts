// apps/backend/src/modules/catalog/application/queries/list-catalog-listings/list-catalog-listings.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListCatalogListingsQuery } from './list-catalog-listings.query';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { Company } from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { AnonymizerService } from '../../../../barterborsa/application/services/anonymizer.service';
import { populateDynamicBadges } from '../../helpers/badge-evaluator.helper';

@QueryHandler(ListCatalogListingsQuery)
export class ListCatalogListingsHandler implements IQueryHandler<ListCatalogListingsQuery> {
  constructor(private readonly anonymizer: AnonymizerService) {}

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

    // Master Plan v4.3 §4.2 — Fabrika ekosistemi görünürlük + zaman filtresi
    // Public scope'ta NONE/null visibleTo veya zaman aralığı dışındaki ekosistem listing'leri gizlenir
    if (!isAdmin && !isVendorScope) {
      const now = new Date();
      filter.$and = [
        // Ekosistem dışı (genel pazaryeri) veya ekosistem içi ama görünürlük açık
        {
          $or: [
            { ecosystemId: { $exists: false } },
            { ecosystemId: null },
            { visibleTo: { $in: ['ALL_DEALERS', 'SELECTED_DEALERS'] } },
          ],
        },
        // Zaman aralığı kontrolü (availableFrom yoksa veya geçtiyse)
        { $or: [{ availableFrom: { $exists: false } }, { availableFrom: null }, { availableFrom: { $lte: now } }] },
        { $or: [{ availableTo: { $exists: false } }, { availableTo: null }, { availableTo: { $gte: now } }] },
      ];
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

    const mappedItems = items.map((l: any) => {
      // Master Plan §4.4 + §5.3 — Ekosistem listing'lerinde gerçek vendor kimliği gizli
      const isEcosystemListing = Boolean(l.ecosystemId);
      const exposeRealIdentity = isAdmin || (isVendor && vendors[l.vendorId]?.userId === userId);
      const showVendor = !isEcosystemListing || exposeRealIdentity;

      return {
        id: l.id,
        name: l.title,
        price: l.price ? Number(l.price) : 0,
        stock: l.stock,
        sku: l.sku || '',
        barcode: l.barcode || '',
        status: l.status,
        images: mediaMap[l.catalogProductId] || [],
        category: catalogProducts[l.catalogProductId]?.categoryId || null,
        // Sadece görünürlük izinliyse gerçek vendor adı
        vendorName: showVendor ? (vendors[l.vendorId]?.company?.name || 'Bilinmeyen Satıcı') : 'Anonim Bayi',
        anonymousVendorId: isEcosystemListing && !exposeRealIdentity
          ? this.anonymizer.anonymize(l.vendorId, 'vendor')
          : undefined,
        catalogProduct: catalogProducts[l.catalogProductId] || null,
        // Master Plan §4.2 — ekosistem alanları
        ecosystemId: l.ecosystemId,
        visibleTo: l.visibleTo,
        availableFrom: l.availableFrom,
        availableTo: l.availableTo,
        allowOnlineResale: l.allowOnlineResale ?? false,
        maxOrderQtyPerDealer: l.maxOrderQtyPerDealer,
        userTier: vendors[l.vendorId]?.tier || 'CORE',
      };
    });

    await populateDynamicBadges(mappedItems);

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
