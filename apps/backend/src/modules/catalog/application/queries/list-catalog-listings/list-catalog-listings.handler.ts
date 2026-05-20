// apps/backend/src/modules/catalog/application/queries/list-catalog-listings/list-catalog-listings.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListCatalogListingsQuery } from './list-catalog-listings.query';
import { Listing }   from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { Vendor }    from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { Company }   from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { AnonymizerService } from '../../../../barterborsa/application/services/anonymizer.service';
import { populateDynamicBadges } from '../../helpers/badge-evaluator.helper';

const { VendorProfile } = require('@barterborsa/shared-persistence/schemas/backend/vendorProfile.schema');

@QueryHandler(ListCatalogListingsQuery)
export class ListCatalogListingsHandler implements IQueryHandler<ListCatalogListingsQuery> {
  constructor(private readonly anonymizer: AnonymizerService) {}

  async execute(query: ListCatalogListingsQuery) {
    const { userId, userRole, filters } = query;
    const { search, page = 1, limit = 50, city, isFeatured, isFlashSale, isSpecialOffer } = filters;
    const skip = (page - 1) * limit;

    const roles      = Array.isArray(userRole) ? userRole : (userRole ? [userRole] : []);
    const isAdmin    = roles.some(r => ['ADMIN', 'SUPER_ADMIN'].includes(r));
    const isVendor   = roles.includes('VENDOR');
    const isVendorScope = filters.scope === 'vendor';

    const filter: Record<string, unknown> = {};

    // ── Statü & kapsam filtresi ───────────────────────────────────────────
    if (!isAdmin && !isVendorScope) {
      filter.status   = 'ACTIVE';
      filter.isActive = true;
    }

    if (isAdmin) {
      // Admin tümünü görür — isActive filtresi opsiyonel
      if (filters.isActive !== undefined) filter.isActive = filters.isActive;
    } else if (isVendor && userId) {
      const vendor = await Vendor.findOne({ userId }).exec();
      if (vendor) {
        filter.vendorId = vendor.id;
      } else {
        return { items: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      }
    } else if (!isVendorScope) {
      filter.status   = 'ACTIVE';
      filter.isActive = true;
    }

    // ── Ürün tipi filtreleri ──────────────────────────────────────────────
    if (isFeatured  !== undefined) filter.isFeatured    = isFeatured;
    if (isFlashSale !== undefined) filter.isFlashSale   = isFlashSale;
    if (isSpecialOffer !== undefined) filter.isSpecialOffer = isSpecialOffer;

    if (filters.vendorType) filter.vendorType = filters.vendorType;

    // ── Arama filtresi ────────────────────────────────────────────────────
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sku:   { $regex: search, $options: 'i' } },
      ];
    }

    // ── Şehir (konum) filtresi — vendor profil üzerinden ─────────────────
    // Vendor'ların city bilgisi VendorProfile koleksiyonunda tutulur.
    // Eşleşen vendor ID'leri çekip listing'e uygulanır.
    if (city && city.trim()) {
      const cityRegex = new RegExp(city.trim(), 'i');
      const profiles = await VendorProfile.find({ city: cityRegex }, { vendorId: 1 }).lean().exec();
      const vendorIds = profiles.map((p: { vendorId: string }) => p.vendorId).filter(Boolean);
      if (vendorIds.length === 0) {
        return { items: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      }
      filter.vendorId = { $in: vendorIds };
    }

    // ── Master Plan §4.2 — Ekosistem + zaman filtresi ─────────────────────
    if (!isAdmin && !isVendorScope) {
      const now = new Date();
      const existingAnd = (filter.$and as unknown[]) ?? [];
      filter.$and = [
        ...existingAnd,
        {
          $or: [
            { ecosystemId: { $exists: false } },
            { ecosystemId: null },
            { visibleTo: { $in: ['ALL_DEALERS', 'SELECTED_DEALERS'] } },
          ],
        },
        { $or: [{ availableFrom: { $exists: false } }, { availableFrom: null }, { availableFrom: { $lte: now } }] },
        { $or: [{ availableTo:   { $exists: false } }, { availableTo:   null }, { availableTo:   { $gte: now } }] },
      ];
    }

    // ── Sıralama: öne çıkan ürünler önce, sonra en yeni ─────────────────
    const sort: Record<string, number> = {};
    if (!isFeatured && !isFlashSale && !isSpecialOffer) {
      sort.isFeatured = -1;
    }
    sort.createdAt = -1;

    const [items, total] = await Promise.all([
      Listing.find(filter).skip(skip).limit(limit).sort(sort).lean().exec(),
      Listing.countDocuments(filter).exec(),
    ]);

    // ── İlişkili veriler ──────────────────────────────────────────────────
    const catalogProductIds = [...new Set((items as Record<string, unknown>[]).map(l => l.catalogProductId).filter(Boolean))] as string[];
    const vendorIds         = [...new Set((items as Record<string, unknown>[]).map(l => l.vendorId).filter(Boolean))] as string[];

    const { CatalogProduct } = require('@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema');
    const { ProductMedia }   = require('@barterborsa/shared-persistence/schemas/backend/productMedia.schema');

    const catalogProducts: Record<string, Record<string, unknown>> = {};
    const mediaMap:         Record<string, string[]>               = {};

    if (catalogProductIds.length) {
      const [cps, mediaDocs] = await Promise.all([
        CatalogProduct.find({ id: { $in: catalogProductIds } }).lean().exec(),
        ProductMedia.find({ productId: { $in: catalogProductIds } }).lean().exec(),
      ]);
      for (const cp of cps as Record<string, unknown>[])       catalogProducts[cp.id as string] = cp;
      for (const m  of mediaDocs as Record<string, unknown>[]) {
        if (!mediaMap[m.productId as string]) mediaMap[m.productId as string] = [];
        mediaMap[m.productId as string].push(m.url as string);
      }
    }

    const vendors: Record<string, Record<string, unknown>> = {};
    const vendorCityMap: Record<string, string>            = {};

    if (vendorIds.length) {
      const vs = await Vendor.find({ id: { $in: vendorIds } }).lean().exec() as Record<string, unknown>[];
      const companyIds = vs.map(v => v.companyId).filter(Boolean) as string[];

      const [companies, vendorProfiles] = await Promise.all([
        companyIds.length ? Company.find({ id: { $in: companyIds } }).lean().exec() : Promise.resolve([]),
        VendorProfile.find({ vendorId: { $in: vendorIds } }, { vendorId: 1, city: 1 }).lean().exec(),
      ]);

      const companyMap: Record<string, Record<string, unknown>> = {};
      for (const c of companies as Record<string, unknown>[]) companyMap[c.id as string] = c;

      for (const p of vendorProfiles as Record<string, unknown>[]) {
        if (p.vendorId) vendorCityMap[p.vendorId as string] = (p.city as string) ?? '';
      }
      for (const v of vs) {
        vendors[v.id as string] = { ...v, company: companyMap[v.companyId as string] };
      }
    }

    // ── Mapping ───────────────────────────────────────────────────────────
    const mappedItems = (items as Record<string, unknown>[]).map(l => {
      const isEcosystemListing = Boolean(l.ecosystemId);
      const exposeRealIdentity = isAdmin || (isVendor && (vendors[l.vendorId as string] as Record<string, unknown>)?.userId === userId);
      const showVendor         = !isEcosystemListing || exposeRealIdentity;

      return {
        id:          l.id,
        name:        l.title,
        price:       l.price ? Number(l.price) : 0,
        stock:       l.stock,
        sku:         l.sku   || '',
        barcode:     l.barcode || '',
        status:      l.status,
        isActive:    l.isActive ?? true,
        // 4 görünürlük bayrağı — tüm katmanlara taşınır
        isFeatured:    l.isFeatured    ?? false,
        isFlashSale:   l.isFlashSale   ?? false,
        isSpecialOffer:l.isSpecialOffer ?? false,
        images:  mediaMap[l.catalogProductId as string] || [],
        category:catalogProducts[l.catalogProductId as string]?.categoryId || null,
        city:    vendorCityMap[l.vendorId as string] || '',
        vendorName: showVendor
          ? ((vendors[l.vendorId as string] as Record<string, unknown>)?.company as Record<string, unknown>)?.name as string || 'Bilinmeyen Satıcı'
          : 'Anonim Bayi',
        anonymousVendorId: isEcosystemListing && !exposeRealIdentity
          ? this.anonymizer.anonymize(l.vendorId as string, 'vendor')
          : undefined,
        catalogProduct:       catalogProducts[l.catalogProductId as string] || null,
        ecosystemId:          l.ecosystemId,
        visibleTo:            l.visibleTo,
        availableFrom:        l.availableFrom,
        availableTo:          l.availableTo,
        allowOnlineResale:    l.allowOnlineResale ?? false,
        maxOrderQtyPerDealer: l.maxOrderQtyPerDealer,
        userTier: (vendors[l.vendorId as string] as Record<string, unknown>)?.tier || 'CORE',
      };
    });

    await populateDynamicBadges(mappedItems);

    return {
      items: mappedItems,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
