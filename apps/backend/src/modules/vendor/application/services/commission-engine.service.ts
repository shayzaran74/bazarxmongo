// apps/backend/src/modules/vendor/application/services/commission-engine.service.ts
// Master Plan v4.3 §3.2 — TicariTakas B2B komisyon motoru

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { VendorTier } from '../../domain/enums/vendor-tier.enum';
import { VendorTierVO } from '../../domain/value-objects/vendor-tier.vo';
import { Decimal } from 'decimal.js';

export interface CommissionInput {
  vendorId:           string;
  transactionAmount:  number;
  isGroupTransaction: boolean;  // Aynı BrandEcosystem içi mi?
  xpToApply:          number;   // Kullanmak istenen XP (1XP = 1₺ indirim)
  referenceId:        string;
  referenceType:      'TRADE' | 'ORDER';
}

export interface CommissionBreakdown {
  vendorTier:         VendorTier;
  transactionAmount:  number;
  standardRate:       number;
  appliedRate:        number;
  rateType:           'STANDARD' | 'GROUP' | 'XP_DISCOUNTED';
  totalCommission:    number;
  cashCommission:     number;   // nakit ödenen
  xpCommission:       number;   // XP ile ödenen (1XP=1₺)
  vendorNetAmount:    number;   // işlemden geriye kalan
}

@Injectable()
export class CommissionEngineService {
  private readonly logger = new Logger(CommissionEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calculate(input: CommissionInput): Promise<CommissionBreakdown> {
    const { vendorId, transactionAmount, isGroupTransaction, xpToApply } = input;

    // Vendor tier'ını DB'den al
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { tier: true },
    });
    if (!vendor) throw new BadRequestException('Vendor bulunamadı');

    const tier   = vendor.tier as VendorTier;
    const tierVO = VendorTierVO.create(tier);
    const amount = new Decimal(transactionAmount);

    // Grup içi işlem → XP indirimi uygulanamaz (Master Plan §3.2)
    // Ekosisteme özel internalCommRate önceliklidir; yoksa tier tabanlı grup oranı
    if (isGroupTransaction) {
      const ecosystem = await this.prisma.brandEcosystem.findFirst({
        where: {
          OR: [
            { ownerId: vendorId },
            { members: { some: { id: vendorId } } },
          ],
        },
        select: { internalCommRate: true },
      });

      const groupRate = ecosystem
        ? Number(ecosystem.internalCommRate)
        : tierVO.getGroupCommissionRate();

      const commission = amount.mul(groupRate).div(100).toDecimalPlaces(2);

      return {
        vendorTier:        tier,
        transactionAmount,
        standardRate:      tierVO.getCommissionRate(),
        appliedRate:       groupRate,
        rateType:          'GROUP',
        totalCommission:   commission.toNumber(),
        cashCommission:    commission.toNumber(),
        xpCommission:      0,
        vendorNetAmount:   amount.sub(commission).toNumber(),
      };
    }

    const standardRate      = tierVO.getCommissionRate();
    const xpDiscountedRate  = tierVO.getXpDiscountedRate();
    const standardCommission = amount.mul(standardRate).div(100).toDecimalPlaces(2);
    const xpDiscountedComm   = amount.mul(xpDiscountedRate).div(100).toDecimalPlaces(2);

    // XP uygulanıyor mu?
    if (xpToApply > 0) {
      // Max XP indirimi = standart komisyon - XP indirimli komisyon
      const maxXpReduction = standardCommission.sub(xpDiscountedComm);
      const effectiveXp    = Decimal.min(new Decimal(xpToApply), maxXpReduction).toDecimalPlaces(2);

      if (effectiveXp.lte(0)) {
        this.logger.warn('XP indirimi hesaplandı ama sıfır çıktı', { vendorId, xpToApply });
      }

      const cashCommission = standardCommission.sub(effectiveXp).toDecimalPlaces(2);

      return {
        vendorTier:        tier,
        transactionAmount,
        standardRate,
        appliedRate:       standardRate,
        rateType:          'XP_DISCOUNTED',
        totalCommission:   standardCommission.toNumber(),
        cashCommission:    cashCommission.toNumber(),
        xpCommission:      effectiveXp.toNumber(),
        vendorNetAmount:   amount.sub(standardCommission).toNumber(),
      };
    }

    // Standart oran
    return {
      vendorTier:        tier,
      transactionAmount,
      standardRate,
      appliedRate:       standardRate,
      rateType:          'STANDARD',
      totalCommission:   standardCommission.toNumber(),
      cashCommission:    standardCommission.toNumber(),
      xpCommission:      0,
      vendorNetAmount:   amount.sub(standardCommission).toNumber(),
    };
  }

  // Takas öncesi komisyon ön görüntüsü (kayıt olmadan hesapla)
  async preview(input: CommissionInput): Promise<CommissionBreakdown> {
    return this.calculate(input);
  }
}
