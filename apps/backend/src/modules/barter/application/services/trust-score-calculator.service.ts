// apps/backend/src/modules/barter/application/services/trust-score-calculator.service.ts
// Master Plan v4.3 §3.3 — TrustScore Algoritması

import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { ITrustScoreRepository } from '../../../vendor/domain/repositories/trust-score.repository.interface';
import { IUserLevelRepository } from '../../domain/repositories/user-level.repository.interface';

// Ağırlıklar (toplam: %100)
const WEIGHT_TRADING    = 0.40;
const WEIGHT_XP_LOYALTY = 0.30;
const WEIGHT_COMPLIANCE = 0.30;

const INACTIVITY_THRESHOLD_DAYS   = 90;
const INACTIVITY_PENALTY_PER_MONTH = 10;
const LOW_XP_PENALTY_PER_MONTH     = 5;

export interface TrustScoreComponents {
  trading:    number;
  xpLoyalty:  number;
  compliance: number;
  overall:    number;
}

@Injectable()
export class TrustScoreCalculatorService {
  private readonly logger = new Logger(TrustScoreCalculatorService.name);

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('ITradeOfferRepository') private readonly tradeOfferRepo: ITradeOfferRepository,
    @Inject('ITrustScoreRepository') private readonly trustScoreRepo: ITrustScoreRepository,
    @Inject('IUserLevelRepository') private readonly userLevelRepo: IUserLevelRepository,
  ) {}

  async recalculate(vendorId: string): Promise<TrustScoreComponents> {
    const [trading, xpLoyalty, compliance] = await Promise.all([
      this.calculateTradingPerformance(vendorId),
      this.calculateXpLoyalty(vendorId),
      this.calculateCompliance(vendorId),
    ]);

    const overall = Math.max(
      0,
      Math.min(100, Math.round(
        trading    * WEIGHT_TRADING    +
        xpLoyalty  * WEIGHT_XP_LOYALTY +
        compliance * WEIGHT_COMPLIANCE,
      )),
    );

    await this.trustScoreRepo.upsert(vendorId, {
      score: overall,
      tradingPerformance: trading,
      xpLoyalty,
      compliance,
    });

    this.logger.debug('TrustScore güncellendi', { vendorId, overall, trading, xpLoyalty, compliance });
    return { trading, xpLoyalty, compliance, overall };
  }

  private async calculateTradingPerformance(vendorId: string): Promise<number> {
    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) return 50;

    const props = vendor.getProps();
    const companyId = (props as any).companyId;

    if (!companyId) return 80;

    // Tamamlanan ve toplam teklif sayısını çek
    const allOffers = await this.tradeOfferRepo.findByCompanyWithFilters(companyId, 0, 1000);
    const completedOffers = await this.tradeOfferRepo.findByCompanyWithFilters(
      companyId, 0, 1000, ['COMPLETED', 'CLOSED'],
    );

    const total = allOffers.items.length;
    const completed = completedOffers.items.length;

    if (total === 0) return 80;

    const completionRate = completed / total;
    let score = Math.round(completionRate * 100);

    const existingScore = await this.trustScoreRepo.findByVendorId(vendorId);
    const inactiveDays = (existingScore as any)?.inactiveDays ?? 0;

    if (inactiveDays >= INACTIVITY_THRESHOLD_DAYS) {
      const months  = Math.floor(inactiveDays / 30);
      const penalty = months * INACTIVITY_PENALTY_PER_MONTH;
      score         = Math.max(0, score - penalty);
    }

    return Math.min(100, score);
  }

  private async calculateXpLoyalty(vendorId: string): Promise<number> {
    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) return 50;

    const props = vendor.getProps();
    const userId = (props as any).userId;
    if (!userId) return 50;

    const userLevel = await this.userLevelRepo.findByUserId(userId);
    const currentXp = (userLevel as any)?.currentXp ?? 0;

    if (currentXp <= 0) {
      return 50;
    }

    const score = Math.min(100, Math.round((currentXp / 500) * 100));

    const existingScore = await this.trustScoreRepo.findByVendorId(vendorId);
    const currentLoyalty = (existingScore as any)?.xpLoyalty ?? 100;

    if (currentXp === 0) {
      return Math.max(0, currentLoyalty - LOW_XP_PENALTY_PER_MONTH);
    }

    return score;
  }

  private async calculateCompliance(vendorId: string): Promise<number> {
    const score = await this.trustScoreRepo.findByVendorId(vendorId);

    if (!score) return 100;

    const violations = (score as any).violationCount ?? 0;
    let complianceScore = 100;

    if (violations >= 3) {
      complianceScore = 0;
    } else if (violations === 2) {
      complianceScore = 85;
    }

    return complianceScore;
  }
}