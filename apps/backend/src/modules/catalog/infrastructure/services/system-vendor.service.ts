import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';

@Injectable()
export class SystemVendorService implements OnModuleInit {
  private systemVendorId: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.refreshSystemVendorId();
    } catch (error: any) {
      console.warn('SystemVendorService: Initial setup failed, will retry later:', error.message);
    }
  }

  async refreshSystemVendorId() {
    const v = await this.prisma.vendor.findFirst({
      where: { profile: { storeName: 'BazarX Sistem' } },
      select: { id: true }
    });
    
    if (v) {
      this.systemVendorId = v.id;
    } else {
      this.systemVendorId = await this.createSystemVendor();
    }
  }

  getSystemVendorId(): string {
    if (!this.systemVendorId) {
      console.warn('SystemVendorService: systemVendorId requested but not yet initialized');
      return '';
    }
    return this.systemVendorId;
  }

  private async createSystemVendor(): Promise<string> {
    // Önce şirketi bul veya oluştur
    const company = await this.prisma.company.upsert({
      where: { id: 'bazarx-system-company' },
      update: {},
      create: {
        id: 'bazarx-system-company',
        name: 'BazarX Sistem',
        status: 'APPROVED',
        vatRate: 20
      }
    });

    // Sistem Admin kullanıcısını bul (ilk ADMIN olanı veya özel bir ID)
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    if (!admin) {
      console.error('CRITICAL: No admin user found to associate with system vendor. Seed the database!');
      return null as any;
    }

    const vendor = await this.prisma.vendor.create({
      data: {
        userId: admin.id,
        companyId: company.id,
        status: 'APPROVED',
        slug: 'bazarx-sistem-core',
        profile: {
          create: {
            storeName: 'BazarX Sistem',
            description: 'Sistem satıcısı'
          }
        }
      },
      select: { id: true }
    });

    return vendor.id;
  }
}
