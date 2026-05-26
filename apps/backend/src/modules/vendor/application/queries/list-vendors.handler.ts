// apps/backend/src/modules/vendor/application/queries/list-vendors.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { safeRegexFilter } from '../../../../common/utils/regex.utils';
import { ListVendorsQuery } from './list-vendors.query';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IVendor } from '@barterborsa/shared-persistence/schemas/backend/vendor.schema';
import { ICompany } from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { IUser } from '@barterborsa/shared-persistence/schemas/backend/user.schema';

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
  constructor(@InjectConnection() private readonly connection: Connection) {}

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

    const VendorModel = this.connection.model('Vendor');
    const [vendors, total] = await Promise.all([
      VendorModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean().exec(),
      VendorModel.countDocuments(filter).exec(),
    ]);

    const companyIds = [...new Set(vendors.map(v => v.companyId).filter(Boolean))] as string[];
    const userEmails = [...new Set(vendors.map(v => v.userId).filter(Boolean))] as string[];
    const vendorIds  = vendors.map(v => v.id);

    const CompanyModel = this.connection.model('Company');
    const UserModel = this.connection.model('User');
    const VendorProfileModel = this.connection.model('VendorProfile');

    const [companies, users, profiles] = await Promise.all([
      companyIds.length ? CompanyModel.find({ id: { $in: companyIds } }).lean().exec() : [],
      userEmails.length ? UserModel.find({ email: { $in: userEmails } }).lean().exec() : [],
      vendorIds.length  ? VendorProfileModel.find({ vendorId: { $in: vendorIds } }).lean().exec() : [],
    ]);

    const companyMap = new Map<string, (typeof companies)[0]>(
      companies.reduce((acc, c) => acc.set(c.id, c), new Map<string, (typeof companies)[0]>()),
    );
    const userMap = new Map<string, (typeof users)[0]>(
      users.reduce((acc, u) => acc.set(u.email, u), new Map<string, (typeof users)[0]>()),
    );
    const profileMap = new Map((profiles as { vendorId: string }[]).map(p => [p.vendorId, p]));

    const items = vendors.map((v) => {
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
        businessName: profile?.storeName || (company as unknown as { name?: string })?.name || 'İsimsiz İşletme',
        email:       (user as unknown as { email?: string })?.email || v.userId,
        phone:       (user as unknown as { phoneNumber?: string | null })?.phoneNumber || null,
        productCount: 0,
        isFeatured:  false,
        profile: {
          storeName: profile?.storeName || (company as unknown as { name?: string })?.name || v.slug || 'İsimsiz İşletme',
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