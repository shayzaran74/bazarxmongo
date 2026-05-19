import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ListAdminVendorsQuery } from './list-admin-vendors.query';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';

@QueryHandler(ListAdminVendorsQuery)
export class ListAdminVendorsHandler
  implements IQueryHandler<ListAdminVendorsQuery> {
  private readonly logger = new Logger(ListAdminVendorsHandler.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @InjectModel('Company') private readonly companyModel: Model<any>,
    @InjectModel('VendorProfile') private readonly vendorProfileModel: Model<any>,
    @InjectModel('User') private readonly userModel: Model<any>,
    @InjectModel('UserProfile') private readonly userProfileModel: Model<any>,
    @InjectModel('VendorCategory') private readonly vendorCategoryModel: Model<any>,
    @InjectModel('Category') private readonly categoryModel: Model<any>,
    @InjectModel('Listing') private readonly listingModel: Model<any>,
  ) {}

  async execute(query: ListAdminVendorsQuery) {
    const { search, status, page = 1, limit = 20 } = query.filters;
    const skip = (page - 1) * limit;

    const result = await this.vendorRepo.search({
      searchTerm: search,
      status,
      skip,
      take: limit,
    });

    const vendorIds = result.items.map(v => v.id);
    const companyIds = result.items.map(v => v.companyId).filter(Boolean);
    const userEmails = result.items.map(v => v.userId).filter(Boolean);

    // parallel fetches
    const [
      companies,
      vendorProfiles,
      users,
      userProfiles,
      vendorCategories,
      listingsCounts
    ] = await Promise.all([
      this.companyModel.find({ id: { $in: companyIds } }).lean(),
      this.vendorProfileModel.find({ $or: [{ vendorId: { $in: vendorIds } }, { userId: { $in: userEmails } }] }).lean(),
      this.userModel.find({ email: { $in: userEmails } }).lean(),
      this.userProfileModel.find({ userId: { $in: userEmails } }).lean(),
      this.vendorCategoryModel.find({ vendorId: { $in: vendorIds } }).lean(),
      this.listingModel.aggregate([
        { $match: { vendorId: { $in: vendorIds } } },
        { $group: { _id: '$vendorId', count: { $sum: 1 } } }
      ])
    ]);

    // fetch all category details if there are any assigned vendor categories
    const categoryIds = vendorCategories.map(vc => vc.categoryId).filter(Boolean);
    const categories = categoryIds.length > 0
      ? await this.categoryModel.find({ id: { $in: categoryIds } }).lean()
      : [];

    const companyMap = new Map(companies.map(c => [c.id, c]));
    const vendorProfileMap = new Map(vendorProfiles.map(p => [p.vendorId || p.userId, p]));
    const userMap = new Map(users.map(u => [u.email, u]));
    const userProfileMap = new Map(userProfiles.map(p => [p.userId, p]));
    const listingsCountMap = new Map(listingsCounts.map(item => [item._id, item.count]));
    const categoryMap = new Map((categories as any[]).map((cat: any) => [cat.id || cat._id?.toString(), cat]));

    // group categories by vendor
    const vendorCategoriesMap = new Map<string, any[]>();
    for (const vc of vendorCategories as any[]) {
      const cat = categoryMap.get(vc.categoryId);
      if (!vendorCategoriesMap.has(vc.vendorId)) {
        vendorCategoriesMap.set(vc.vendorId, []);
      }
      vendorCategoriesMap.get(vc.vendorId)!.push({
        id: vc.id || vc._id?.toString(),
        category: cat ? { name: cat.name } : null
      });
    }

    const items = result.items.map((v: any) => {
      const p = v.getProps ? v.getProps() : v;
      const vid = (p as any).id || v.id;
      const company = companyMap.get((p as any).companyId);
      const vProfile = vendorProfileMap.get(vid) || vendorProfileMap.get((p as any).userId);
      const user = userMap.get((p as any).userId);
      const uProfile = userProfileMap.get((p as any).userId);
      
      const userObj = user ? {
        id: user.id || (user as any)._id?.toString(),
        email: user.email,
        profile: uProfile ? {
          firstName: uProfile.firstName,
          lastName: uProfile.lastName,
          phone: uProfile.phone
        } : null
      } : null;

      const profileObj = vProfile ? {
        storeName: vProfile.storeName || company?.name || 'İsimsiz Satıcı',
        isFeatured: vProfile.isFeatured,
        city: vProfile.city,
        district: vProfile.district,
        logo: vProfile.logo,
        supportEmail: vProfile.supportEmail,
        description: vProfile.description,
        cuisineType: vProfile.cuisineType,
        deliveryRadius: vProfile.deliveryRadius,
        avgPrepTimeMinutes: vProfile.avgPrepTimeMinutes
      } : {
        storeName: company?.name || 'İsimsiz Satıcı',
        isFeatured: false,
      };

      const countListings = listingsCountMap.get(vid) || 0;
      const vCats = vendorCategoriesMap.get(vid) || [];

      return {
        id:         vid,
        status:     (p as any).status || v.status,
        tier:       (p as any).tier || v.tier,
        vendorType: (p as any).vendorType || v.vendorType,
        slug:       (p as any).slug || v.slug,
        company:    company ? { name: company.name } : null,
        profile:    profileObj,
        user:       userObj,
        vendorCategories: vCats,
        _count: {
          listings: countListings
        }
      };
    });

    return {
      items,
      total: result.total,
      page,
      limit
    };
  }
}
