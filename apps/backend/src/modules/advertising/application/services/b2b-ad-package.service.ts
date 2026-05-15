// apps/backend/src/modules/advertising/application/services/b2b-ad-package.service.ts
// Master Plan v4.3 §3.2 — B2B Reklam Paketi yönetimi
// Vendor Prime 1-4 paketi satın aldığında AdCampaign oluşturur ve fiyat/içeriği uygular.

import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import {
  B2BAdPackageType,
  B2BAdPackagePeriod,
  B2BAdPackageDefinition,
  B2B_AD_PACKAGES,
} from '../../domain/enums/b2b-ad-package.enum';

export interface B2BAdPackagePurchaseInput {
  vendorId: string;
  type:     B2BAdPackageType;
  period:   B2BAdPackagePeriod;
  // Vendor satın alımı için isteğe bağlı kreatif bilgileri
  imageUrl?:  string;
  linkUrl?:   string;
  startDate?: Date;
}

export interface B2BAdPackagePurchaseResult {
  campaignId:   string;
  type:         B2BAdPackageType;
  period:       B2BAdPackagePeriod;
  price:        number;
  comboValue:   number;
  startDate:    Date;
  endDate:      Date;
}

@Injectable()
export class B2BAdPackageService {
  private readonly logger = new Logger(B2BAdPackageService.name);

  constructor(
    private readonly prisma:   PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  // Tüm paketleri listele (frontend için)
  listPackages(): B2BAdPackageDefinition[] {
    return Object.values(B2B_AD_PACKAGES);
  }

  // Tek paket detay
  getPackage(type: B2BAdPackageType): B2BAdPackageDefinition {
    const pkg = B2B_AD_PACKAGES[type];
    if (!pkg) throw new NotFoundException(`Reklam paketi bulunamadı: ${type}`);
    return pkg;
  }

  // Fiyat hesaplama (period'a göre)
  calculatePrice(type: B2BAdPackageType, period: B2BAdPackagePeriod): number {
    const pkg = this.getPackage(type);
    return period === 'WEEKLY' ? pkg.weeklyPrice : pkg.monthlyPrice;
  }

  // Master Plan v4.3 §3.2 — Paket satın alma
  // Vendor seçtiği paketi satın alır, sistem AdCampaign oluşturur ve
  // paket bilgileri metadata'da saklanır (gelir raporlaması için).
  async purchasePackage(input: B2BAdPackagePurchaseInput): Promise<B2BAdPackagePurchaseResult> {
    const pkg     = this.getPackage(input.type);
    const price   = this.calculatePrice(input.type, input.period);
    const startAt = input.startDate ?? new Date();
    const endAt   = this.computeEndDate(startAt, input.period);

    // Vendor B2B aidatı aktif mi? (havuz erişimi gibi)
    const vendor = await this.prisma.vendor.findUnique({
      where:  { id: input.vendorId },
      select: {
        status: true,
        b2bData: {
          select: {
            isB2B:              true,
            subscriptionStatus: true,
          },
        },
      },
    });

    if (!vendor || vendor.status !== 'APPROVED') {
      throw new BadRequestException('Vendor onaylı değil, reklam paketi satın alınamaz.');
    }
    if (!vendor.b2bData?.isB2B) {
      throw new BadRequestException('Bu paket yalnızca B2B (TicariTakas) üyeler içindir.');
    }
    if (!['ACTIVE', 'GRACE_PERIOD'].includes(vendor.b2bData.subscriptionStatus)) {
      throw new BadRequestException(
        'B2B aidat ödemeniz aktif değil. Reklam paketi satın almak için aidatınızı yenileyin.',
      );
    }

    const campaign = await this.prisma.adCampaign.create({
      data: {
        name:            `${input.type} ${input.period === 'WEEKLY' ? 'Haftalık' : 'Aylık'}`,
        platform:        'BARTERBORSA',  // B2B paketleri TicariTakas/BarterBorsa kanalında yayınlanır
        budget:          price,
        remainingBudget: price,
        adType:          'BANNER',
        bidAmount:       0,
        billingModel:    'PREPAID',
        pricingModel:    'FIXED',
        startDate:       startAt,
        endDate:         endAt,
        vendorId:        input.vendorId,
        imageUrl:        input.imageUrl,
        linkUrl:         input.linkUrl,
        adStatus:        'PENDING',
        metadata: {
          b2bPackageType: input.type,
          period:         input.period,
          comboValue:     pkg.comboValue,
          contentSummary: pkg.contentSummary,
        },
      },
      select: { id: true },
    });

    await this.auditLog.log({
      actorId:      input.vendorId,
      action:       'B2B_AD_PACKAGE_PURCHASED',
      resourceType: 'AdCampaign',
      resourceId:   campaign.id,
      newValue: {
        type:       input.type,
        period:     input.period,
        price,
        comboValue: pkg.comboValue,
        startDate:  startAt,
        endDate:    endAt,
      },
    });

    this.logger.log('B2B reklam paketi satın alındı', {
      vendorId: input.vendorId,
      type:     input.type,
      period:   input.period,
      price,
    });

    return {
      campaignId: campaign.id,
      type:       input.type,
      period:     input.period,
      price,
      comboValue: pkg.comboValue,
      startDate:  startAt,
      endDate:    endAt,
    };
  }

  // Süreye göre bitiş tarihi
  private computeEndDate(start: Date, period: B2BAdPackagePeriod): Date {
    const end = new Date(start);
    if (period === 'WEEKLY') {
      end.setDate(end.getDate() + 7);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return end;
  }
}
