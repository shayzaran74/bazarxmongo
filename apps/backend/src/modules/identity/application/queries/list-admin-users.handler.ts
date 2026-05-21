// apps/backend/src/modules/identity/application/queries/list-admin-users.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser, IUserProfile, IVendor, UserStatusType, UserRoleType, ICompany } from '@barterborsa/shared-persistence';
import { ListAdminUsersQuery } from './list-admin-users.query';

interface UserFilter {
  status?: UserStatusType;
  role?: UserRoleType;
  $or?: Array<Record<string, unknown>>;
  deletedAt?: { $exists: boolean };
}

@QueryHandler(ListAdminUsersQuery)
export class ListAdminUsersHandler implements IQueryHandler<ListAdminUsersQuery> {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @InjectModel('UserProfile') private readonly profileModel: Model<IUserProfile>,
    @InjectModel('Vendor') private readonly vendorModel: Model<IVendor>,
    @InjectModel('Company') private readonly companyModel: Model<ICompany>,
  ) {}

  async execute(query: ListAdminUsersQuery) {
    const { search, status, role, page = 1, limit = 10 } = query.filters;
    const skip = (page - 1) * limit;

    const where: UserFilter = { deletedAt: { $exists: false } };

    if (search) {
      where.$or = [
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) where.status = status.toUpperCase() as UserStatusType;
    if (role)   where.role   = role.toUpperCase() as UserRoleType;

    const [users, total] = await Promise.all([
      this.userModel.find(where).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.userModel.countDocuments(where),
    ]);

    // Profil ve vendor bilgisi toplu sorgu — profiller userId=email ile saklanıyor
    const userEmails = users.map(u => u.email).filter(Boolean);

    const [profiles, vendors] = await Promise.all([
      this.profileModel.find({ userId: { $in: userEmails } }).lean(),
      this.vendorModel.find({ userId: { $in: userEmails } }).lean(),
    ]);

    const companyIds = vendors.map(v => (v as Record<string, unknown>).companyId).filter(Boolean) as string[];
    const companies = await this.companyModel.find({ id: { $in: companyIds } }).lean();

    const profileMap = new Map(profiles.map(p => [(p as Record<string, unknown>).userId as string, p]));
    const vendorMap  = new Map(vendors.map(v => [(v as Record<string, unknown>).userId as string, v]));
    const companyMap = new Map(companies.map(c => [(c as Record<string, unknown>).id as string, c]));

    const items = users.map(u => {
      const profile = profileMap.get(u.email);
      const vendor  = vendorMap.get(u.email);
      const company = vendor ? companyMap.get(vendor.companyId) : null;

      return {
        ...u,
        profile,
        vendor: vendor ? {
          ...vendor,
          businessName: company?.name 
            || (vendor as Record<string, unknown>).storeName as string
            || (vendor as Record<string, unknown>).companyName as string
            || 'İsimsiz İşletme',
        } : null,
        userName: profile
          ? `${(profile as Record<string, unknown>).firstName ?? ''} ${(profile as Record<string, unknown>).lastName ?? ''}`.trim()
          : u.email,
      };
    });

    return {
      items,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
