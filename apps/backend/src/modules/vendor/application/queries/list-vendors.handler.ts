// apps/backend/src/modules/vendor/application/queries/list-vendors.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { safeRegexFilter } from '../../../../common/utils/regex.utils';
import { ListVendorsQuery } from './list-vendors.query';
import { Vendor, IVendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { Company, ICompany } from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { User, IUser } from '@barterborsa/shared-persistence/schemas/backend/user.schema';
import { VendorProfile } from '@barterborsa/shared-persistence/schemas/backend/vendorProfile.schema';

interface VendorListItem {
  id: string;
  slug: string;
  tier: string;
  status: string;
  vendorType?: string;
  userId: string;
  companyId?: string;
  businessName: string;
  email: string;
  phone?: string | null;
  productCount: number;
  isFeatured: boolean;
  profile: {
    storeName: string;
    city?: string | null;
    imageUrl?: string | null;
    isFeatured: boolean;
    description: string;
    cuisineType: string;
    rating: number;
  };
}

interface VendorListResult {
  items: VendorListItem[];
  total: number;
  page: number;
  limit: number;
}

@QueryHandler(ListVendorsQuery)
export class ListVendorsHandler implements IQueryHandler<ListVendorsQuery, VendorListResult> {

  async execute(query: ListVendorsQuery): Promise<VendorListResult> {
    const { params } = query;
    const page  = Number(params.page  || 1);
    const limit = Number(params.limit || 10);
    const skip  = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (params.status)     filter.status     = params.status.toUpperCase();
    if (params.tier)       filter.tier       = params.tier.toUpperCase();
    if (params.vendorType) filter.vendorType = params.vendorType;
    if (params.search) {
      const regex = safeRegexFilter(params.search);
      if (regex) filter.$or = [{ slug: regex }];
    }

    const [vendors, total] = await Promise.all([
      Vendor.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean().exec(),
      Vendor.countDocuments(filter).exec(),
    ]);

    const companyIds = [...new Set(vendors.map(v => v.companyId).filter(Boolean))] as string[];
    const userEmails = [...new Set(vendors.map(v => v.userId).filter(Boolean))] as string[];
    const vendorIds  = vendors.map(v => v.id);

    const [companies, users, profiles] = await Promise.all([
      companyIds.length ? Company.find({ id: { $in: companyIds } }).lean().exec() : [],
      userEmails.length ? User.find({ email: { $in: userEmails } }).lean().exec() : [],
      vendorIds.length  ? VendorProfile.find({ vendorId: { $in: vendorIds } }).lean().exec() : [],
    ]);

    const companyMap = new Map<string, ICompany>(companies.map(c => [(c as ICompany).id, c as ICompany] as [string, ICompany]));
    const userMap    = new Map<string, IUser>(users.map(u => [(u as IUser).email, u as IUser] as [string, IUser]));
    const profileMap = new Map((profiles as { vendorId: string }[]).map(p => [p.vendorId, p]));

    const items = vendors.map((v: IVendor) => {
      const company = companyMap.get(v.companyId);
      const user    = userMap.get(v.userId);
      const profile = profileMap.get(v.id) as { storeName?: string; city?: string; logo?: string; description?: string; cuisineType?: string } | undefined;

      return {
        id:          v.id,
        slug:        v.slug,
        tier:        v.tier,
        status:      v.status,
        vendorType:  v.vendorType,
        userId:      v.userId,
        companyId:   v.companyId,
        businessName: profile?.storeName || (company as ICompany)?.name || 'İsimsiz İşletme',
        email:       (user as IUser)?.email || v.userId,
        phone:       (user as IUser)?.phoneNumber || null,
        productCount: 0,
        isFeatured:  false,
        profile: {
          storeName: profile?.storeName || (company as ICompany)?.name || v.slug || 'İsimsiz İşletme',
          city: profile?.city || null,
          imageUrl: profile?.logo || null,
          isFeatured: false,
          description: profile?.description || '',
          cuisineType: profile?.cuisineType || '',
          rating: 5,
        },
      };
    });

    return { items, total, page, limit };
  }
}