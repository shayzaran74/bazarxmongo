// packages/domain-identity/src/application/commands/update-profile.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { Result, Ok } from '@barterborsa/shared-core';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { PrismaService } from '@barterborsa/shared-persistence';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand, Result<any>> {
  constructor(
    @Inject('IUserProfileRepository') private readonly profileRepository: IUserProfileRepository,
    private readonly prisma: PrismaService,
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
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { vendor: true },
      });

      if (user?.role === 'VENDOR' && user.vendor?.companyId) {
        await this.prisma.company.update({
          where: { id: user.vendor.companyId },
          data: {
            name: dto.companyName || undefined,
            taxNumber: dto.taxNumber || undefined,
            taxOffice: dto.taxOffice || undefined,
            status: 'PENDING',
          },
        });
        await this.prisma.vendor.update({
          where: { id: user.vendor.id },
          data: { status: 'PENDING' },
        });
      }
    }

    // Güncel kullanıcıyı düzleştirilmiş halde dön
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        vendor: { include: { company: true } },
      },
    });

    if (!updatedUser) return Ok({ user: null });

    const flatUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      firstName: updatedUser.profile?.firstName,
      lastName: updatedUser.profile?.lastName,
      profile: updatedUser.profile ? {
        phone: updatedUser.profile.phone,
        city: updatedUser.profile.city,
        district: updatedUser.profile.district,
        neighborhood: updatedUser.profile.neighborhood,
        gender: updatedUser.profile.gender,
        bio: updatedUser.profile.bio,
        avatar: updatedUser.profile.avatar,
        birthday: updatedUser.profile.birthday,
        firstName: updatedUser.profile.firstName,
        lastName: updatedUser.profile.lastName,
      } : undefined,
      vendor: updatedUser.vendor ? {
        status: updatedUser.vendor.status,
        company: updatedUser.vendor.company ? {
          name: updatedUser.vendor.company.name,
          taxNumber: updatedUser.vendor.company.taxNumber,
          taxOffice: updatedUser.vendor.company.taxOffice,
        } : undefined,
      } : undefined,
    };

    return Ok({ user: flatUser });
  }
}
