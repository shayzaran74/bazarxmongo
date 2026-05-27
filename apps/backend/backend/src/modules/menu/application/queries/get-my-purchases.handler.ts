// apps/backend/src/modules/menu/application/queries/get-my-purchases.handler.ts
// BazarX Go: Aktif QR'lar — MenuPurchase artık Listing FK'sı ile çalışır

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenuPurchase, IListing, IVendor, IUserProfile } from '@barterborsa/shared-persistence';
import { GetMyPurchasesQuery } from './get-my-purchases.query';

@QueryHandler(GetMyPurchasesQuery)
export class GetMyPurchasesHandler implements IQueryHandler<GetMyPurchasesQuery> {
  constructor(
    @InjectModel('MenuPurchase') private readonly purchaseModel: Model<IMenuPurchase>,
    @InjectModel('Listing')      private readonly listingModel:  Model<IListing>,
    @InjectModel('Vendor')       private readonly vendorModel:   Model<IVendor>,
    @InjectModel('UserProfile')  private readonly profileModel:  Model<IUserProfile>,
  ) {}

  async execute(query: GetMyPurchasesQuery) {
    const { userId, activeOnly } = query;

    const where: Record<string, unknown> = { userId };
    if (activeOnly) {
      where.status      = { $in: ['ACTIVE', 'PARTIALLY_REDEEMED'] };
      where.qrExpiresAt = { $gte: new Date() };
    }

    const purchases = await this.purchaseModel.find(where).sort({ createdAt: -1 }).lean();

    // Batch listing + vendor + profile lookup
    const listingIds  = [...new Set(purchases.map(p => p.listingId))];
    const listings    = await this.listingModel.find({ id: { $in: listingIds } }, { id: 1, title: 1, vendorId: 1 }).lean();
    const vendorIds   = [...new Set(listings.map(l => l.vendorId))];
    const vendors     = await this.vendorModel.find({ id: { $in: vendorIds } }, { id: 1, userId: 1 }).lean();
    const userIds     = vendors.map(v => v.userId);
    const profiles    = await this.profileModel.find({ userId: { $in: userIds } }, { userId: 1, storeName: 1, city: 1, district: 1 }).lean();

    const listingMap  = new Map(listings.map(l => [l.id, l]));
    const vendorMap   = new Map(vendors.map(v => [v.id, v]));
    const profileMap  = new Map(profiles.map(p => [p.userId, p]));

    return purchases.map(p => {
      const listing = listingMap.get(p.listingId);
      const vendor  = listing ? vendorMap.get(listing.vendorId) : null;
      const profile = vendor  ? profileMap.get(vendor.userId)  : null;
      const pr      = profile as Record<string, unknown> | undefined;

      return {
        id:               p.id,
        status:           p.status,
        menuTitle:        listing?.title ?? '',
        restaurant: {
          id:       listing?.vendorId ?? '',
          name:     pr?.storeName ?? '',
          city:     pr?.city ?? null,
          district: pr?.district ?? null,
        },
        paidAmount:       parseFloat(p.paidAmount.toString()),
        qrCode:           p.qrCode,
        qrExpiresAt:      p.qrExpiresAt,
        oneFreeQrCode:    p.oneFreeQrCode,
        oneFreeActivated: !!p.oneFreeActivatedAt,
        oneFreeUsed:      !!p.oneFreeUsedAt,
        xpEarned:         p.xpEarned,
        createdAt:        p.createdAt,
      };
    });
  }
}
