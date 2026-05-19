// apps/backend/src/modules/menu/application/queries/get-launch-partners.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ILaunchPartner, IVendor, IUserProfile, LaunchPartnerPhaseType } from '@barterborsa/shared-persistence';
import { GetLaunchPartnersQuery } from './get-launch-partners.query';

@QueryHandler(GetLaunchPartnersQuery)
export class GetLaunchPartnersHandler implements IQueryHandler<GetLaunchPartnersQuery> {
  constructor(
    @InjectModel('LaunchPartner') private readonly partnerModel: Model<ILaunchPartner>,
    @InjectModel('Vendor')        private readonly vendorModel:  Model<IVendor>,
    @InjectModel('UserProfile')   private readonly profileModel: Model<IUserProfile>,
  ) {}

  async execute(query: GetLaunchPartnersQuery) {
    const { phase, city, page = 1, limit = 20 } = query.filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (phase) where.phase = phase;

    const [items, total] = await Promise.all([
      this.partnerModel.find(where).skip(skip).limit(limit).sort({ startDate: -1 }).lean(),
      this.partnerModel.countDocuments(where),
    ]);

    // Batch vendor + profile lookup
    const vendorIds = items.map(lp => lp.vendorId);
    const vendors   = await this.vendorModel.find({ id: { $in: vendorIds } }, { id: 1, userId: 1 }).lean();
    const userIds   = vendors.map(v => v.userId);
    const profiles  = await this.profileModel.find({ userId: { $in: userIds } }, { userId: 1, storeName: 1, city: 1, district: 1 }).lean();

    const vendorMap  = new Map(vendors.map(v => [v.id, v]));
    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    const result = items
      .filter(lp => {
        if (!city) return true;
        const vendor  = vendorMap.get(lp.vendorId);
        const profile = vendor ? profileMap.get(vendor.userId) : null;
        return profile ? String((profile as Record<string, unknown>).city ?? '').toLowerCase().includes(city.toLowerCase()) : false;
      })
      .map(lp => {
        const vendor  = vendorMap.get(lp.vendorId);
        const profile = vendor ? profileMap.get(vendor.userId) : null;
        const p       = profile as Record<string, unknown> | undefined;

        return {
          id:  lp.id,
          restaurant: {
            id:       lp.vendorId,
            name:     p?.storeName ?? '',
            city:     p?.city ?? null,
            district: p?.district ?? null,
          },
          phase:            lp.phase,
          pledgedMenuCount: lp.pledgedMenuCount,
          distributedCount: lp.distributedCount,
          remainingMenus:   lp.pledgedMenuCount - lp.distributedCount,
          progressPct:      Math.round((lp.distributedCount / (lp.pledgedMenuCount || 1)) * 100),
          freeAdMonths:     lp.freeAdMonths,
          adMonthsUsed:     lp.adMonthsUsed,
          startDate:        lp.startDate,
          phase2StartDate:  lp.phase2StartDate,
          phase3StartDate:  lp.phase3StartDate,
        };
      });

    return { items: result, total, page, limit };
  }
}
