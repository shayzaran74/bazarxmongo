import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetVendorProductsQuery } from './get-vendor-products.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IListingRepository } from '../../../catalog/domain/repositories/listing.repository.interface';
import { Listing } from '../../../catalog/domain/entities/listing.entity';

interface ListingImageDoc { listingId: string; url: string; order: number; }
interface ProductMediaDoc { productId: string; url: string; order: number; }

@QueryHandler(GetVendorProductsQuery)
export class GetVendorProductsHandler implements IQueryHandler<GetVendorProductsQuery> {
  private readonly logger = new Logger(GetVendorProductsHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IListingRepository') private readonly listingRepo: IListingRepository,
  ) {}

  async execute(query: GetVendorProductsQuery) {
    const { userId, filters } = query;
    const { search, categoryId, limit = 100 } = filters;

    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor not found');

    const vendorId = vendor.id;

    // Kategori filtresi varsa repository search'ü kullan (ListingProps'ta categoryId alanı yoktur)
    let listings: Listing[];
    if (categoryId) {
      const searchResult = await this.listingRepo.search({ vendorId, categoryId, take: Number(limit) });
      listings = searchResult.items;
    } else {
      listings = await this.listingRepo.findByVendorId(vendorId);
    }

    let filtered: Listing[] = listings;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(l => {
        const p = l.getProps();
        return p.title.toLowerCase().includes(s) || (p.sku ?? '').toLowerCase().includes(s);
      });
    }

    const result = filtered.slice(0, Number(limit));
    const listingIds = result.map(l => l.id);
    const catalogProductIds = result.map(l => l.getProps().catalogProductId).filter(Boolean);

    const mongoose = require('mongoose');
    const [listingImages, productMedia] = await Promise.all([
      listingIds.length ? mongoose.model('ListingImage').find({ listingId: { $in: listingIds } }).lean().exec() : [],
      catalogProductIds.length ? mongoose.model('ProductMedia').find({ productId: { $in: catalogProductIds }, type: 'IMAGE' }).lean().exec() : [],
    ]);

    const listingImageMap = new Map<string, ListingImageDoc>();
    (listingImages as ListingImageDoc[]).forEach(img => {
      const existing = listingImageMap.get(img.listingId);
      if (!existing || img.order < existing.order) listingImageMap.set(img.listingId, img);
    });

    const productMediaMap = new Map<string, ProductMediaDoc>();
    (productMedia as ProductMediaDoc[]).forEach(media => {
      const existing = productMediaMap.get(media.productId);
      if (!existing || media.order < existing.order) productMediaMap.set(media.productId, media);
    });

    return result.map(l => {
      const p = l.getProps();
      const lImage = listingImageMap.get(l.id);
      const cMedia = productMediaMap.get(p.catalogProductId);
      return {
        id:       l.id,
        name:     p.title,
        sku:      p.sku,
        price:    p.price.amount,
        stock:    p.stock,
        status:   p.status,
        image:    lImage?.url || cMedia?.url || null,
        Category: null,
      };
    });
  }
}
