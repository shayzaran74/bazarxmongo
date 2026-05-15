import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserQuery } from './get-user.query';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { Result, Ok, Err, NotFoundException } from '@barterborsa/shared-core';
import { PrismaService } from '@barterborsa/shared-persistence';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, Result<any>> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService
  ) {}

  async execute(query: GetUserQuery): Promise<Result<any>> {
    // Prisma'dan tüm ilişkileriyle birlikte çek
    const record = await this.prisma.user.findUnique({
      where: { id: query.userId },
      include: {
        profile: true,
        vendor: {
          include: {
            company: true
          }
        }
      }
    });

    if (!record) {
      return Err(new NotFoundException('Kullanıcı bulunamadı.'));
    }

    // Frontend'in beklediği formatta düzleştirilmiş (flattened) kullanıcı nesnesi
    const flatUser = {
      id: record.id,
      email: record.email,
      role: record.role,
      status: record.status,
      platform: record.platform,
      isEmailVerified: record.isEmailVerified,
      phoneNumber: record.phoneNumber,
      firstName: record.profile?.firstName || undefined,
      lastName: record.profile?.lastName || undefined,
      avatar: record.profile?.avatar || undefined,
      lastLoginAt: record.lastLoginAt,
      createdAt: record.createdAt,
      // Profile verisi (şehir, ilçe, telefon vb.)
      profile: record.profile ? {
        phone: record.profile.phone,
        city: record.profile.city,
        district: record.profile.district,
        neighborhood: record.profile.neighborhood,
        avatar: record.profile.avatar,
        bio: record.profile.bio,
        birthday: record.profile.birthday,
        gender: record.profile.gender,
        firstName: record.profile.firstName,
        lastName: record.profile.lastName,
      } : undefined,
      // Vendor verisi
      vendor: record.vendor ? {
        status: record.vendor.status,
        slug: (record.vendor as any).slug,
        company: record.vendor.company ? {
          id: record.vendor.company.id,
          name: record.vendor.company.name,
          taxNumber: record.vendor.company.taxNumber,
          taxOffice: record.vendor.company.taxOffice,
        } : undefined
      } : undefined,
    };

    return Ok(flatUser);
  }
}
