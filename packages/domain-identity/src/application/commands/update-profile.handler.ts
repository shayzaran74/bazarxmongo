// packages/domain-identity/src/application/commands/update-profile.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { Result, Ok } from '@barterborsa/shared-core';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { User as UserModel, Vendor as VendorModel, Company as CompanyModel, UserProfile as UserProfileModel } from '@barterborsa/shared-persistence';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand, Result<any>> {
  constructor(
    @Inject('IUserProfileRepository') private readonly profileRepository: IUserProfileRepository,
  ) { }

  async execute(command: UpdateProfileCommand): Promise<Result<any>> {
    const { userId, dto } = command;

    // Profil kaydını bul veya oluştur (DDD entity flow)
    let profile = await this.profileRepository.findByUserId(userId);

    const profileProps = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phoneNumber,
      avatar: dto.avatar ?? dto.avatarUrl,
      bio: dto.bio,
      birthday: dto.birthday ? new Date(dto.birthday as string) : undefined,
      gender: dto.gender,
      city: dto.city,
      district: dto.district,
      neighborhood: dto.neighborhood,
    };

    if (!profile) {
      profile = UserProfile.create({ userId, ...profileProps });
      await this.profileRepository.save(profile);
    } else {
      profile.update(profileProps);
      await this.profileRepository.update(profile);
    }

    // Vendor ise şirket bilgileri değiştiğinde yeniden onaya gönder
    if (dto.companyName || dto.taxNumber || dto.taxOffice) {
      const user = await UserModel.findOne({ id: userId }).exec();

      if (user?.role === 'VENDOR') {
        const vendor = await VendorModel.findOne({ userId: userId }).exec();
        
        if (vendor?.companyId) {
          await CompanyModel.updateOne(
            { id: vendor.companyId },
            {
              $set: {
                name: dto.companyName || undefined,
                taxNumber: dto.taxNumber || undefined,
                taxOffice: dto.taxOffice || undefined,
                status: 'PENDING',
              },
            }
          ).exec();
          
          await VendorModel.updateOne(
            { id: vendor.id },
            { $set: { status: 'PENDING' } }
          ).exec();
        }
      }
    }

    // Güncel kullanıcıyı düzleştirilmiş halde dön
    const updatedUser = await UserModel.findOne({ id: userId }).exec();
    const userProfileDoc = await UserProfileModel.findOne({ userId: userId }).exec();
    const vendorDoc = await VendorModel.findOne({ userId: userId }).exec();
    let companyDoc = null;
    
    if (vendorDoc?.companyId) {
      companyDoc = await CompanyModel.findOne({ id: vendorDoc.companyId }).exec();
    }

    if (!updatedUser) return Ok({ user: null });

    const flatUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      firstName: userProfileDoc?.firstName,
      lastName: userProfileDoc?.lastName,
      profile: userProfileDoc ? {
        phone: userProfileDoc.phone,
        city: userProfileDoc.city,
        district: userProfileDoc.district,
        neighborhood: (userProfileDoc as any).neighborhood,
        gender: userProfileDoc.gender,
        bio: userProfileDoc.bio,
        avatar: userProfileDoc.avatar,
        birthday: userProfileDoc.birthday,
        firstName: userProfileDoc.firstName,
        lastName: userProfileDoc.lastName,
      } : undefined,
      vendor: vendorDoc ? {
        status: vendorDoc.status,
        company: companyDoc ? {
          name: companyDoc.name,
          taxNumber: companyDoc.taxNumber,
          taxOffice: companyDoc.taxOffice,
        } : undefined,
      } : undefined,
    };

    return Ok({ user: flatUser });
  }
}
