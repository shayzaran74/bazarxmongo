import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserQuery } from './get-user.query';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { Result, Ok, Err, NotFoundException } from '@barterborsa/shared-core';
import { User as UserModel, Vendor as VendorModel, Company as CompanyModel, UserProfile as UserProfileModel } from '@barterborsa/shared-persistence';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, Result<any>> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) { }

  async execute(query: GetUserQuery): Promise<Result<any>> {
    const userId = query.userId;

    const record = await UserModel.findOne({ id: userId }).exec();
    
    if (!record) {
      return Err(new NotFoundException('Kullanıcı bulunamadı.'));
    }

    const userProfileDoc = await UserProfileModel.findOne({ userId: userId }).exec();
    const vendorDoc = await VendorModel.findOne({ userId: userId }).exec();
    let companyDoc = null;
    
    if (vendorDoc?.companyId) {
      companyDoc = await CompanyModel.findOne({ id: vendorDoc.companyId }).exec();
    }

    // Frontend'in beklediği formatta düzleştirilmiş (flattened) kullanıcı nesnesi
    const flatUser = {
      id: record.id,
      email: record.email,
      role: record.role,
      status: record.status,
      platform: (record as any).platform,
      isEmailVerified: record.isEmailVerified,
      phoneNumber: record.phoneNumber,
      firstName: userProfileDoc?.firstName || undefined,
      lastName: userProfileDoc?.lastName || undefined,
      avatar: userProfileDoc?.avatar || undefined,
      lastLoginAt: record.lastLoginAt,
      createdAt: record.createdAt,
      // Profile verisi (şehir, ilçe, telefon vb.)
      profile: userProfileDoc ? {
        phone: userProfileDoc.phone,
        city: userProfileDoc.city,
        district: userProfileDoc.district,
        neighborhood: (userProfileDoc as any).neighborhood,
        avatar: userProfileDoc.avatar,
        bio: userProfileDoc.bio,
        birthday: userProfileDoc.birthday,
        gender: userProfileDoc.gender,
        firstName: userProfileDoc.firstName,
        lastName: userProfileDoc.lastName,
      } : undefined,
      // Vendor verisi
      vendor: vendorDoc ? {
        status: vendorDoc.status,
        tier: (vendorDoc as any).tier,
        slug: (vendorDoc as any).slug,
        barterEnabled: (vendorDoc as any).barterEnabled,
        ecosystemId: (vendorDoc as any).ecosystemId,
        company: companyDoc ? {
          id: companyDoc.id,
          name: companyDoc.name,
          taxNumber: companyDoc.taxNumber,
          taxOffice: companyDoc.taxOffice,
        } : undefined
      } : undefined,
    };

    return Ok(flatUser);
  }
}
