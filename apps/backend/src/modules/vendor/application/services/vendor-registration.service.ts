import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';

@Injectable()
export class VendorRegistrationService {
  private readonly logger = new Logger(VendorRegistrationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerAtomic(userId: string, body: any) {
    const { 
      businessName, businessType, taxId, phone, email, address, 
      city, district, zipCode, bankName, bankAccountName, bankIban,
      categories 
    } = body;

    // 0. Ön kontroller
    if (!userId) {
      return { success: false, error: 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.' };
    }

    const existingVendor = await this.prisma.vendor.findUnique({
      where: { userId }
    });

    if (existingVendor) {
      return { success: false, error: 'Bu kullanıcı için zaten bir satıcı kaydı bulunmaktadır.' };
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Şirket oluştur
        const company = await tx.company.create({
          data: {
            name: businessName,
            taxNumber: taxId || null, 
            phone,
            email,
            address,
            companyType: businessType,
            status: 'PENDING'
          }
        });

        // 2. Slug üret
        const slug = this.slugify(businessName) + '-' + Math.random().toString(36).substring(7);

        // 3. Vendor oluştur
        const vendor = await tx.vendor.create({
          data: {
            userId: userId,
            companyId: company.id,
            slug,
            status: 'PENDING',
            tier: 'CORE'
          }
        });

        // 4. Profil oluştur
        await tx.vendorProfile.create({
          data: {
            vendorId: vendor.id,
            storeName: businessName,
            city: city, 
            district: district
          }
        });

        // 5. Ayarlar oluştur
        await tx.vendorSettings.create({
          data: {
            vendorId: vendor.id
          }
        });

        // 6. Banka hesabı ekle
        if (bankIban) {
          await tx.vendorBankAccount.create({
            data: {
              vendorId: vendor.id,
              bankName: bankName || 'Bilinmeyen Banka',
              accountHolderName: bankAccountName || businessName,
              iban: bankIban
            }
          });
        }

        // 7. Kategorileri bağla
        if (categories && Array.isArray(categories)) {
          for (const catId of categories) {
            await tx.vendorCategory.create({
              data: {
                vendorId: vendor.id,
                categoryId: catId
              }
            });
          }
        }

        // 8. Kullanıcı rolünü güncelle
        await tx.user.update({
          where: { id: userId },
          data: { role: 'VENDOR' }
        });

        return { success: true, data: vendor };
      });
    } catch (error: any) {
      this.logger.error('Vendor Atomic Application Error', error.stack);

      if (error.code === 'P2002') {
        const target = error.meta?.target || [];
        if (target.includes('tax_number') || target.includes('taxId')) {
          return { success: false, error: 'Bu vergi numarası zaten kullanılmaktadır.' };
        }
        if (target.includes('slug')) {
          return { success: false, error: 'Bu mağaza adı zaten kullanılmaktadır. Lütfen farklı bir ad deneyin.' };
        }
      }

      return { success: false, error: 'Kayıt sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata') };
    }
  }

  private slugify(text: string): string {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }
}
