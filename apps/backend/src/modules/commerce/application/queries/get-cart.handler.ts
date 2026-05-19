// apps/backend/src/modules/commerce/application/queries/get-cart.handler.ts
// GetCartHandler — Mongoose migration (ADR-005 Faz 2b)

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCartQuery } from './get-cart.query';
import { MongoCartRepository } from '../../infrastructure/persistence/mongo-cart.repository';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';

@QueryHandler(GetCartQuery)
export class GetCartHandler implements IQueryHandler<GetCartQuery> {
  constructor(private readonly cartRepo: MongoCartRepository) {}

  async execute(query: GetCartQuery) {
    let cart = await this.cartRepo.findByUserId(query.userId);
    if (!cart) {
      cart = await this.cartRepo.findOrCreate(query.userId);
    }

    const items = cart.getProps().items;
    const listingIds = items.map(i => i.getProps().listingId).filter(Boolean);

    // Fetch listings
    const listings = listingIds.length > 0 
      ? await Listing.find({ id: { $in: listingIds } }).lean() 
      : [];

    const catalogProductIds = listings.map(l => l.catalogProductId).filter(Boolean);

    // Fetch catalog products
    const products = catalogProductIds.length > 0 
      ? await CatalogProduct.find({ id: { $in: catalogProductIds } }).lean() 
      : [];

    // Fetch media
    const media = catalogProductIds.length > 0
      ? await ProductMedia.find({ productId: { $in: catalogProductIds } }).sort({ sortOrder: 1 }).lean()
      : [];

    let total = 0;

    const enriched = items.map(item => {
      const itemProps = item.getProps();
      const listing = listings.find(l => l.id === itemProps.listingId);
      const product = listing ? products.find(p => p.id === listing.catalogProductId) : null;
      const prodMedia = product ? media.filter(m => m.productId === product.id) : [];

      const price = listing ? Number(listing.price) : 0;
      total += price * itemProps.quantity;

      return {
        id: item.id,
        listingId: itemProps.listingId,
        quantity: itemProps.quantity,
        price,
        addedAt: itemProps.addedAt,
        Product: product ? {
          id: product.id,
          name: product.name,
          image: prodMedia[0]?.url || 'https://placehold.co/600x600?text=PRODUCT',
          description: product.description,
          price,
          stock: listing ? listing.stock : 0,
        } : null,
      };
    });

    return {
      items: enriched,
      summary: {
        total,
        subtotal: total,
        tax: 0,
        shipping: 0,
        totalPrice: total,
        totalItems: items.reduce((acc, item) => acc + item.getProps().quantity, 0),
      },
    };
  }
}
