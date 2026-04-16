// apps/backend/src/modules/vendor/application/commands/register-vendor.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterVendorCommand } from './register-vendor.command';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IVendorProfileRepository } from '../../domain/repositories/vendor-profile.repository.interface';
import { IVendorSettingsRepository } from '../../domain/repositories/vendor-settings.repository.interface';
import { ICompanyRepository } from '../../domain/repositories/company.repository.interface';
import { Vendor } from '../../domain/entities/vendor.entity';
import { VendorProfile } from '../../domain/entities/vendor-profile.entity';
import { VendorSettings } from '../../domain/entities/vendor-settings.entity';
import { VendorSlug } from '../../domain/value-objects/vendor-slug.vo';
import { ConflictException, NotFoundException, DomainException } from '@barterborsa/shared-core';
import { Inject } from '@nestjs/common';

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

    // 2. Kullanıcı zaten vendor mı?
    const existingVendor = await this.vendorRepository.findByUserId(userId);
    if (existingVendor) {
      throw new ConflictException('Bu kullanıcı için zaten bir satıcı kaydı mevcut.');
    }

    // 3. Slug üret
    const slug = VendorSlug.fromStoreName(dto.storeName);
    const slugExists = await this.vendorRepository.findBySlug(slug);
    if (slugExists) {
       throw new ConflictException('Bu mağaza adı ile ilişkili slug zaten kullanımda.');
    }

    // 4. Vendor Oluştur
    const vendor = Vendor.create(userId, dto.companyId, slug, dto.storeName);
    
    // 5. Profil Oluştur
    const profile = VendorProfile.create({
      vendorId: vendor.id,
      storeName: dto.storeName,
      description: dto.description,
      logo: dto.logo,
      supportEmail: dto.supportEmail,
      city: dto.city,
      district: dto.district,
    });

    // 6. Ayarlar Oluştur
    const settings = VendorSettings.create(vendor.id);

    // Kaydet (Gerçek senaryoda UnitOfWork kullanılmalı, burada repo bazlı ilerliyoruz)
    await this.vendorRepository.save(vendor);
    await this.profileRepository.save(profile);
    await this.settingsRepository.save(settings);

    return vendor.id;
  }
}
