// apps/backend/src/modules/vendor/application/queries/list-vendors.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListVendorsQuery } from './list-vendors.query';
import { Vendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { Company } from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { User } from '@barterborsa/shared-persistence/schemas/backend/user.schema';

@QueryHandler(ListVendorsQuery)
export class ListVendorsHandler implements IQueryHandler<ListVendorsQuery> {

  async execute(query: ListVendorsQuery): Promise<any> {
    const { params } = query;
    const page  = Number(params.page  || 1);
    const limit = Number(params.limit || 10);
    const skip  = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (params.status)     filter.status     = params.status.toUpperCase();
    if (params.tier)       filter.tier       = params.tier.toUpperCase();
    if (params.vendorType) filter.vendorType = params.vendorType;
    if (params.search)     filter.$or = [
      { slug: { $regex: params.search, $options: 'i' } },
      { userId: { $regex: params.search, $options: 'i' } },
    ];

    const [vendors, total] = await Promise.all([
      Vendor.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean().exec(),
      Vendor.countDocuments(filter).exec(),
    ]);

    const companyIds = [...new Set(vendors.map((v: any) => v.companyId).filter(Boolean))];
    const userEmails = [...new Set(vendors.map((v: any) => v.userId).filter(Boolean))];

    const [companies, users] = await Promise.all([
      companyIds.length ? Company.find({ id: { $in: companyIds } }).lean().exec() : [],
      userEmails.length ? User.find({ email: { $in: userEmails } }).lean().exec() : [],
    ]);

    const companyMap = new Map((companies as any[]).map(c => [c.id, c]));
    const userMap    = new Map((users as any[]).map(u => [u.email, u]));

    const items = vendors.map((v: any) => {
      const company = companyMap.get(v.companyId);
      const user    = userMap.get(v.userId);
      return {
        id:          v.id,
        slug:        v.slug,
        tier:        v.tier,
        status:      v.status,
        vendorType:  v.vendorType,
        userId:      v.userId,
        companyId:   v.companyId,
        businessName: company?.name || 'İsimsiz İşletme',
        email:       user?.email || v.userId,
        phone:       user?.phoneNumber || null,
        productCount: 0,
        isFeatured:  v.isFeatured || false,
        profile: {
          storeName: company?.name || v.slug || 'İsimsiz İşletme',
          city: v.city || null,
          imageUrl: v.logo || null,
          isFeatured: v.isFeatured || false,
        },
      };
    });

    return { items, total, page, limit };
  }
}
