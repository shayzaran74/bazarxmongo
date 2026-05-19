import { Types } from 'mongoose';
import { Auction } from '../../domain/entities/auction.entity';
import { Listing as ListingModel } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { CatalogProduct as CatalogProductModel } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Category as CategoryModel } from '@barterborsa/shared-persistence/schemas/backend/category.schema';
import { ProductMedia as ProductMediaModel } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';

export async function populateAuctions(auctions: Auction[]) {
  if (auctions.length === 0) return [];
  
  const listingIds = auctions.map(a => a.getProps().listingId);
  
  // 1. Fetch Listings
  const listings = await ListingModel.find({ id: { $in: listingIds } }).lean().exec();
  const listingsMap = new Map<string, any>();
  for (const l of listings) {
    listingsMap.set(l.id, l);
  }
  
  // 2. Fetch CatalogProducts
  const productIds = listings.map(l => l.catalogProductId).filter(Boolean);
  const products = await CatalogProductModel.find({ id: { $in: productIds } }).lean().exec();
  const productsMap = new Map<string, any>();
  for (const p of products) {
    productsMap.set(p.id, p);
  }
  
  // 3. Fetch Categories
  const categoryIds = products.map(p => p.categoryId).filter(Boolean);
  const categories = await CategoryModel.find({ id: { $in: categoryIds } }).lean().exec();
  const categoriesMap = new Map<string, any>();
  for (const c of categories) {
    categoriesMap.set(c.id, c);
  }
  
  // 4. Fetch Media
  const media = await ProductMediaModel.find({ productId: { $in: productIds } }).sort({ sortOrder: 1 }).lean().exec();
  const mediaMap = new Map<string, any[]>();
  for (const m of media) {
    if (!mediaMap.has(m.productId)) {
      mediaMap.set(m.productId, []);
    }
    mediaMap.get(m.productId)!.push(m);
  }
  
  // 5. Construct mapped output
  return auctions.map(a => {
    const props = a.getProps();
    const listing = listingsMap.get(props.listingId);
    let listingObj: any = null;
    
    if (listing) {
      const product = productsMap.get(listing.catalogProductId);
      let productObj: any = null;
      
      if (product) {
        const category = categoriesMap.get(product.categoryId);
        const prodMedia = mediaMap.get(product.id) || [];
        productObj = {
          id: product.id,
          name: product.name,
          categoryId: product.categoryId,
          category: category ? { id: category.id, name: category.name } : null,
          media: prodMedia.map(m => ({ url: m.url, type: m.type })),
        };
      }
      
      listingObj = {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        catalogProduct: productObj,
      };
    }
    
    return {
      id: a.id,
      listingId: props.listingId,
      userId: props.userId,
      startingPrice: Number(props.startingPrice) || 0,
      currentPrice: Number(props.currentPrice) || 0,
      minBidIncrement: Number(props.minBidIncrement) || 1,
      participationDeposit: props.participationDeposit ? Number(props.participationDeposit) : undefined,
      startTime: props.startTime,
      endTime: props.endTime,
      status: props.status,
      winnerId: props.winnerId,
      winner2Id: props.winner2Id,
      winner3Id: props.winner3Id,
      currentWinnerStep: props.currentWinnerStep,
      paymentDeadline: props.paymentDeadline,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      // For frontend mapping compatibility
      title: listingObj?.title || '',
      description: listingObj?.description || '',
      listing: listingObj,
    };
  });
}
