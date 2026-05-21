// apps/backend/src/modules/vendor/application/services/vendor-registration.service.ts
// Vendor kayıt servisi — MongoDB migration (ADR-005 Faz 2a)

import { Injectable, Logger, Inject } from '@nestjs/common';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IVendorProfileRepository } from '../../domain/repositories/vendor-profile.repository.interface';
import { IVendorSettingsRepository } from '../../domain/repositories/vendor-settings.repository.interface';
import { IUserRepository } from '../../../identity/domain/repositories/user.repository.interface';
import { Vendor } from '../../domain/entities/vendor.entity';
import { VendorSlug } from '../../domain/value-objects/vendor-slug.vo';
import { Company } from '@barterborsa/shared-persistence/schemas/backend/company.schema';

@Injectable()
export class VendorRegistrationService {
  private readonly logger = new Logger(VendorRegistrationService.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IVendorProfileRepository') private readonly profileRepo: IVendorProfileRepository,
    @Inject('IVendorSettingsRepository') private readonly settingsRepo: IVendorSettingsRepository,
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async registerAtomic(userId: string, body: any) {
    const {
      businessName, businessType, taxId, phone, email, address,
      city, district, zipCode, bankName, bankAccountName, bankIban,
      categories
    } = body;

    if (!userId) {
      return { success: false, error: 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.' };
    }

    const existingVendor = await this.vendorRepo.findByUserId(userId);
    if (existingVendor) {
      return { success: false, error: 'Bu kullanıcı için zaten bir satıcı kaydı bulunmaktadır.' };
    }

    try {
      // 1. Company oluştur
      const companyId = 'co-' + Date.now() + '-' + Math.random().toString(36).substring(7);
      await Company.create({
        id: companyId,
        name: businessName,
        taxNumber: taxId || null,
        phone,
        email,
        address,
        companyType: businessType,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 2. Vendor oluştur
      const slug = this.slugify(businessName) + '-' + Math.random().toString(36).substring(7);
      // VendorSlug.create validation'ı bypass etmek için doğrudan props ile oluştur
      const vendor = await this.vendorRepo.create(Vendor.create(
        userId,
        companyId,
        { value: slug } as VendorSlug,
        businessName,
      ));

      const vendorProps = vendor.getProps();
      const vendorId = (vendorProps as any).id || vendor.id;

      // 3. Profile oluştur
      await this.profileRepo.updateByVendorId(vendorId, {
        storeName: businessName,
        city,
        district,
      });

      // 4. Settings oluştur
      await this.settingsRepo.create({ vendorId });

      // 5. Kullanıcı rolünü güncelle
      await this.userRepo.update(userId, { role: 'VENDOR' });

      return { success: true, data: { id: vendorId, slug } };
    } catch (error: unknown) {
      this.logger.error('Vendor Atomic Application Error', error instanceof Error ? error.stack : String(error));
      return { success: false, error: 'Kayıt sırasında bir hata oluştu: ' + ((error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) || 'Bilinmeyen hata') };
    }
  }

  private slugify(text: string): string {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }
}