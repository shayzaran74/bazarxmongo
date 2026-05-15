// apps/backend/src/modules/vendor/application/services/commission-engine.service.ts
// Master Plan v4.3 §3.2 — TicariTakas B2B komisyon motoru

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { VendorTier } from '../../domain/enums/vendor-tier.enum';
import { VendorTierVO } from '../../domain/value-objects/vendor-tier.vo';
import { Decimal } from 'decimal.js';

export interface CommissionInput {
  vendorId:            string;
  transactionAmount:   number;
  isGroupTransaction:  boolean;  // Aynı BrandEcosystem içi mi?
  xpToApply:           number;   // Kullanmak istenen XP (1XP = 1₺ indirim)
  referenceId:         string;
  referenceType:       'TRADE' | 'ORDER';
  // Master Plan v4.3 §3.4 — İlk işlemde XP kazanımı/kullanımı kapalıdır
  isFirstTransaction?: boolean;
  // Master Plan v4.3 §4 — BarterBorsa kör havuz: grup içi orana değil
  // sabit %6 sistem yönetim bedeline tabi. overrideRate ile tier bypass edilir.
  overrideRate?: number;
}

// Master Plan v4.3 §3.3 — XP indirimi komisyonun max %50'sine uygulanır
const XP_COMMISSION_SUBSIDY_MAX_PCT = 0.50;

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

    // Vendor tier'ını ve B2B aidat/ilk işlem bilgisini DB'den al
    const vendor = await this.prisma.vendor.findUnique({
      where:  { id: vendorId },
      select: {
        tier: true,
        b2bData: {
          select: {
            subscriptionStatus: true,
            firstTransactionAt: true,
          },
        },
      },
    });
    if (!vendor) throw new BadRequestException('Vendor bulunamadı');

    // Master Plan v4.3 §3.4 — İlk işlem kuralı: XP kazanım ve kullanımı kapalı
    // Flag explicit verilmediyse firstTransactionAt'tan türet
    const isFirstTransaction = input.isFirstTransaction
      ?? !vendor.b2bData?.firstTransactionAt;

    if (isFirstTransaction && xpToApply > 0) {
      throw new BadRequestException(
        'İlk işleminizde XP kullanımı kapalıdır (Master Plan §3.4).',
      );
    }

    const tier   = vendor.tier as VendorTier;
    const tierVO = VendorTierVO.create(tier);
    const amount = new Decimal(transactionAmount);

    // Master Plan v4.3 §4 — overrideRate: BarterBorsa sabit %6 sistem yönetim bedeli
    // (tier bağımsız, XP indirimi + grup oranı bypass edilir)
    if (input.overrideRate !== undefined) {
      const commission = amount.mul(input.overrideRate).div(100).toDecimalPlaces(2);
      return {
        vendorTier:       tier,
        transactionAmount,
        standardRate:     input.overrideRate,
        appliedRate:      input.overrideRate,
        rateType:         'GROUP',
        totalCommission:  commission.toNumber(),
        cashCommission:   commission.toNumber(),
        xpCommission:     0,
        vendorNetAmount:  amount.sub(commission).toNumber(),
      };
    }

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
      // Master Plan v4.3 §3.3 — XP indirimi komisyonun max %50'sine uygulanır
      const maxAllowedXp = standardCommission.mul(XP_COMMISSION_SUBSIDY_MAX_PCT).toDecimalPlaces(2);
      if (new Decimal(xpToApply).gt(maxAllowedXp)) {
        throw new BadRequestException(
          `XP indirimi komisyonun %${XP_COMMISSION_SUBSIDY_MAX_PCT * 100}'sini aşamaz. Max: ${maxAllowedXp.toNumber()} XP`,
        );
      }

      // Vendor XP bakiye kontrolü — vendor'a bağlı user'ın UserLevel.currentXp'i
      await this.assertXpBalance(vendorId, xpToApply);

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

  // Master Plan v4.3 §3.4 — Trade tamamlandığında çağrılır
  // İlk işlem yapan vendor'ın firstTransactionAt'i set edilir, sonraki işlemlerde XP açılır.
  async markFirstTransaction(vendorId: string): Promise<void> {
    await this.prisma.vendorB2BData.updateMany({
      where: { vendorId, firstTransactionAt: null },
      data:  { firstTransactionAt: new Date() },
    });
  }

  // Master Plan v4.3 §3.3 — Vendor'a bağlı user'ın XP bakiyesi yeterli mi?
  private async assertXpBalance(vendorId: string, requestedXp: number): Promise<void> {
    const vendor = await this.prisma.vendor.findUnique({
      where:  { id: vendorId },
      select: { userId: true },
    });
    if (!vendor?.userId) {
      throw new BadRequestException('Vendor kullanıcı bağlantısı eksik.');
    }

    const userLevel = await this.prisma.userLevel.findUnique({
      where:  { userId: vendor.userId },
      select: { currentXp: true },
    });
    const balance = userLevel?.currentXp ?? 0;

    if (balance < requestedXp) {
      throw new BadRequestException(
        `XP bakiyesi yetersiz. Mevcut: ${balance} XP, istenen: ${requestedXp} XP`,
      );
    }
  }
}
