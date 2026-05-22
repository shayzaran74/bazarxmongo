// apps/backend/src/modules/vendor/application/services/commission-engine.service.ts
// Master Plan v4.3 §3.2 — TicariTakas B2B komisyon motoru

import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { VendorTier } from '../../domain/enums/vendor-tier.enum';
import { VendorTierVO } from '../../domain/value-objects/vendor-tier.vo';
import { Decimal } from 'decimal.js';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { IVendorB2BDataRepository } from '../../../barter/domain/repositories/vendor-b2b-data.repository.interface';
import { IUserLevelRepository } from '../../../barter/domain/repositories/user-level.repository.interface';
import { MongoBrandEcosystemRepository } from '../../infrastructure/persistence/mongo-brand-ecosystem.repository';

export interface CommissionInput {
  vendorId:            string;
  transactionAmount:   number;
  isGroupTransaction:  boolean;
  xpToApply:           number;
  referenceId:         string;
  referenceType:       'TRADE' | 'ORDER';
  isFirstTransaction?: boolean;
  overrideRate?: number;
}

const XP_COMMISSION_SUBSIDY_MAX_PCT = 0.50;

export interface CommissionBreakdown {
  vendorTier:         VendorTier;
  transactionAmount:  number;
  standardRate:       number;
  appliedRate:        number;
  rateType:           'STANDARD' | 'GROUP' | 'XP_DISCOUNTED';
  totalCommission:    number;
  cashCommission:     number;
  xpCommission:       number;
  vendorNetAmount:    number;
}

@Injectable()
export class CommissionEngineService {
  private readonly logger = new Logger(CommissionEngineService.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IVendorB2BDataRepository') private readonly b2bRepo: IVendorB2BDataRepository,
    @Inject('IUserLevelRepository') private readonly userLevelRepo: IUserLevelRepository,
    private readonly ecosystemRepo: MongoBrandEcosystemRepository,
  ) {}

  async calculate(input: CommissionInput): Promise<CommissionBreakdown> {
    const { vendorId, transactionAmount, isGroupTransaction, xpToApply } = input;

    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) throw new BadRequestException('Vendor bulunamadı');

    const vendorProps = vendor.getProps();
    const tier = vendorProps.tier as VendorTier;
    const tierVO = VendorTierVO.create(tier);
    const amount = new Decimal(transactionAmount);

    // B2B data — firstTransactionAt
    const b2bData = await this.b2bRepo.findByVendorId(vendorId);
    const isFirstTransaction = input.isFirstTransaction
      ?? !(b2bData && b2bData.firstTransactionAt);

    if (isFirstTransaction && xpToApply > 0) {
      throw new BadRequestException(
        'İlk işleminizde XP kullanımı kapalıdır (Master Plan §3.4).',
      );
    }

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

    if (isGroupTransaction) {
      let groupRate = tierVO.getGroupCommissionRate();
      // Vendor'ın ecosystemId'si üzerinden doğrudan ekosistemi bul
      // (memberIds array yerine her vendor'da ecosystemId field'ı kullanılıyor)
      const vendorEcosystemId = vendorProps.ecosystemId as string | undefined;
      if (vendorEcosystemId) {
        const ecosystem = await this.ecosystemRepo.findById(vendorEcosystemId);
        if (ecosystem?.internalCommRate) {
          groupRate = Number(ecosystem.internalCommRate.toString());
        }
      } else {
        // Owner ise kendi ekosistemi bulunur
        const ownedEcosystem = await this.ecosystemRepo.findByOwnerId(vendorId);
        if (ownedEcosystem?.internalCommRate) {
          groupRate = Number(ownedEcosystem.internalCommRate.toString());
        }
      }

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

    const standardRate       = tierVO.getCommissionRate();
    const xpDiscountedRate   = tierVO.getXpDiscountedRate();
    const standardCommission = amount.mul(standardRate).div(100).toDecimalPlaces(2);
    const xpDiscountedComm   = amount.mul(xpDiscountedRate).div(100).toDecimalPlaces(2);

    if (xpToApply > 0) {
      const maxAllowedXp = standardCommission.mul(XP_COMMISSION_SUBSIDY_MAX_PCT).toDecimalPlaces(2);
      if (new Decimal(xpToApply).gt(maxAllowedXp)) {
        throw new BadRequestException(
          `XP indirimi komisyonun %${XP_COMMISSION_SUBSIDY_MAX_PCT * 100}'sini aşamaz. Max: ${maxAllowedXp.toNumber()} XP`,
        );
      }

      const userId = vendorProps.userId;
      await this.assertXpBalance(userId, xpToApply);

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

  async preview(input: CommissionInput): Promise<CommissionBreakdown> {
    return this.calculate(input);
  }

  async markFirstTransaction(vendorId: string): Promise<void> {
    await this.b2bRepo.updateFirstTransaction([vendorId]);
  }

  private async assertXpBalance(userId: string, requestedXp: number): Promise<void> {
    if (!userId) {
      throw new BadRequestException('Vendor kullanıcı bağlantısı eksik.');
    }

    const userLevel = await this.userLevelRepo.findByUserId(userId);
    const balance = userLevel?.currentXp ?? 0;

    if (balance < requestedXp) {
      throw new BadRequestException(
        `XP bakiyesi yetersiz. Mevcut: ${balance} XP, istenen: ${requestedXp} XP`,
      );
    }
  }
}