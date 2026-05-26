// apps/backend/src/modules/vendor/application/commands/register-vendor.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ConflictException, NotFoundException } from '@barterborsa/shared-core';
import { RegisterVendorCommand } from './register-vendor.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IVendorProfileRepository } from '../../domain/repositories/vendor-profile.repository.interface';
import { IVendorSettingsRepository } from '../../domain/repositories/vendor-settings.repository.interface';
import { ICompanyRepository } from '../../domain/repositories/company.repository.interface';
import { Vendor } from '../../domain/entities/vendor.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { VendorSettings } from '../../domain/entities/vendor-settings.entity';
import { VendorSlug } from '../../domain/value-objects/vendor-slug.vo';
import { VendorType } from '../../domain/enums/vendor-type.enum';

@CommandHandler(RegisterVendorCommand)
export class RegisterVendorHandler implements ICommandHandler<RegisterVendorCommand> {
  constructor(
    @Inject('IVendorRepository')
    private readonly vendorRepository: IVendorRepository,
    @Inject('IVendorProfileRepository')
    private readonly profileRepository: IVendorProfileRepository,
    @Inject('IVendorSettingsRepository')
    private readonly settingsRepository: IVendorSettingsRepository,
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(command: RegisterVendorCommand): Promise<string> {
    const { userId, dto } = command;

    // 1. Şirket var mı?
    const company = await this.companyRepository.findById(dto.companyId);
    if (!company) {
      throw new NotFoundException('Kayıtlı şirket bulunamadı.');
    }

    // 2. Kullanıcı zaten vendor mı? (REJECTED durumundaki kayıt bypass edilir — yeni başvuruya izin verilir)
    const existingVendor = await this.vendorRepository.findByUserId(userId);
    if (existingVendor && existingVendor.status !== 'REJECTED') {
      throw new ConflictException('Bu kullanıcı için zaten bir satıcı kaydı mevcut.');
    }

    // 3. Slug üret
    const slug = VendorSlug.fromStoreName(dto.storeName);
    const slugExists = await this.vendorRepository.findBySlug(slug);
    if (slugExists) {
      throw new ConflictException('Bu mağaza adı ile ilişkili slug zaten kullanımda.');
    }

    // 4. Vendor Oluştur (vendorType seçimi — varsayılan COMMERCE)
    const vendorType = dto.vendorType ?? VendorType.COMMERCE;
    const vendor = Vendor.create(userId, dto.companyId, slug, dto.storeName, vendorType);

    // 5. Profil Oluştur (RESTAURANT ise restoran alanlarını da set et)
    const restaurantFields = vendorType === VendorType.RESTAURANT && dto.restaurantProfile
      ? {
          openingHours:       dto.restaurantProfile.openingHours,
          cuisineType:        dto.restaurantProfile.cuisineType,
          deliveryRadius:     dto.restaurantProfile.deliveryRadius,
          minOrderAmount:     dto.restaurantProfile.minOrderAmount,
          avgPrepTimeMinutes: dto.restaurantProfile.avgPrepTimeMinutes,
        }
      : {};

    const profile = VendorProfile.create({
      vendorId:     vendor.id,
      storeName:    dto.storeName,
      description:  dto.description,
      logo:         dto.logo,
      supportEmail: dto.supportEmail,
      city:         dto.city,
      district:     dto.district,
      ...restaurantFields,
    });

    // 6. Ayarlar Oluştur (RESTAURANT için acceptingOrders=true default)
    const settings = VendorSettings.create(vendor.id);

    // Kaydet
    await this.vendorRepository.save(vendor);
    await this.profileRepository.save(profile);
    await this.settingsRepository.save(settings);

    return vendor.id;
  }
}
