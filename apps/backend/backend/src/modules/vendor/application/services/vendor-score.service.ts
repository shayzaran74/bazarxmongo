// apps/backend/src/modules/vendor/application/services/vendor-score.service.ts
// VendorScoreService — TrustScore hesaplaması ve ihlal yönetimi (Master Plan §3.4)

import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IVendorScoreRepository } from '../../domain/repositories/vendor-score.repository.interface';
import { IVendorRepository } from '../../domain/repositories/vendor.repository.interface';
import { ITrustScoreRepository } from '../../domain/repositories/trust-score.repository.interface';
import { VendorScore } from '../../domain/entities/vendor-score.entity';
import { VendorViolation, VendorViolationProps } from '../../domain/entities/vendor-violation.entity';
import { VendorViolationType } from '../../domain/enums/vendor-violation-type.enum';

// Ağırlıklar (Master Plan §3.4)
const WEIGHT_COMMERCIAL = 0.40;
const WEIGHT_XP_LOYALTY = 0.30;
const WEIGHT_COMPLIANCE = 0.30;

// Inactivity threshold
const INACTIVITY_THRESHOLD_DAYS = 90;
const INACTIVITY_PENALTY_PER_MONTH = 10;
const LOW_XP_PENALTY_PER_MONTH = 5;

export interface VendorScoreVO {
  vendorId: string;
  totalScore: number;
  commercialPerformanceScore: number;
  xpLoyaltyScore: number;
  complianceScore: number;
  breakdown: {
    commercialPerformance: number;
    xpLoyalty: number;
    compliance: number;
  };
  violationCount: number;
  lastCalculatedAt: Date;
}

export interface ViolationVO {
  id: string;
  vendorId: string;
  type: VendorViolationType;
  severity: 'WARNING' | 'PENALTY' | 'FREEZE';
  description: string;
  penaltyScore: number | undefined;
  isActive: boolean;
  expiresAt: Date | undefined;
  createdAt: Date;
}

@Injectable()
export class VendorScoreService {
  private readonly logger = new Logger(VendorScoreService.name);

  constructor(
    @Inject('IVendorScoreRepository') private readonly vendorScoreRepo: IVendorScoreRepository,
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('ITrustScoreRepository') private readonly trustScoreRepo: ITrustScoreRepository,
  ) {}

  /**
   * Satıcının mevcut score'unu getir
   */
  async getVendorScore(vendorId: string): Promise<VendorScoreVO | null> {
    const score = await this.vendorScoreRepo.findByVendorId(vendorId);
    if (!score) return null;

    const violationCount = await this.vendorScoreRepo.countActiveViolations(vendorId);

    return {
      vendorId: score.vendorId,
      totalScore: score.totalScore,
      commercialPerformanceScore: score.commercialPerformanceScore,
      xpLoyaltyScore: score.xpLoyaltyScore,
      complianceScore: score.complianceScore,
      breakdown: score.breakdown,
      violationCount,
      lastCalculatedAt: score.lastCalculatedAt,
    };
  }

  /**
   * Satıcının aktif ihlallerini getir
   */
  async getVendorViolations(vendorId: string): Promise<ViolationVO[]> {
    const violations = await this.vendorScoreRepo.findActiveViolationsByVendor(vendorId);
    return violations.map(v => ({
      id: v.id,
      vendorId: v.vendorId,
      type: v.type,
      severity: v.severity,
      description: v.description,
      penaltyScore: v.penaltyScore,
      isActive: v.isActive,
      expiresAt: v.expiresAt,
      createdAt: v.createdAt,
    }));
  }

  /**
   * Yeni ihlal ekle — satıcıyı takip eden sistemlerden çağrılır
   * (Price Floor violation, quota violation, vs.)
   */
  async addViolation(props: {
    vendorId: string;
    type: VendorViolationType;
    description: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    severity?: 'WARNING' | 'PENALTY' | 'FREEZE';
    penaltyScore?: number;
  }): Promise<VendorViolation> {
    const violation = VendorViolation.create(props);
    await this.vendorScoreRepo.saveViolation(violation);

    this.logger.warn('Vendor ihlali eklendi', {
      vendorId: props.vendorId,
      type: props.type,
      severity: props.severity ?? 'WARNING',
    });

    // İhlal eklendikten sonra score'u güncelle
    await this.recalculateScore(props.vendorId);

    return violation;
  }

  /**
   * İhlal affet (admin veya sistem çağrısı)
   */
  async deactivateViolation(violationId: string): Promise<void> {
    await this.vendorScoreRepo.deactivateViolation(violationId);
    this.logger.log('Vendor ihlali pasif yapıldı', { violationId });
  }

  /**
   * Score'u yeniden hesapla — TrustScore repository ile senkronize
   * Buybox ve diğer sistemler bu methodu çağırır
   */
  async recalculateScore(vendorId: string): Promise<VendorScoreVO> {
    const [commercial, xp, compliance] = await Promise.all([
      this.calculateCommercialPerformance(vendorId),
      this.calculateXpLoyalty(vendorId),
      this.calculateComplianceScore(vendorId),
    ]);

    const totalScore = Math.max(0, Math.min(100, Math.round(
      commercial * WEIGHT_COMMERCIAL +
      xp * WEIGHT_XP_LOYALTY +
      compliance * WEIGHT_COMPLIANCE,
    )));

    await this.vendorScoreRepo.upsert({
      vendorId,
      commercialPerformanceScore: commercial,
      xpLoyaltyScore: xp,
      complianceScore: compliance,
      totalScore,
    });

    this.logger.debug('VendorScore güncellendi', { vendorId, totalScore, commercial, xp, compliance });

    return {
      vendorId,
      totalScore,
      commercialPerformanceScore: commercial,
      xpLoyaltyScore: xp,
      complianceScore: compliance,
      breakdown: { commercialPerformance: commercial, xpLoyalty: xp, compliance },
      violationCount: await this.vendorScoreRepo.countActiveViolations(vendorId),
      lastCalculatedAt: new Date(),
    };
  }

  /**
   * Ticari performans hesabı — tamamlanan takas hızı
   */
  private async calculateCommercialPerformance(vendorId: string): Promise<number> {
    // Mevcut TrustScore verisinden çek
    const existing = await this.trustScoreRepo.findByVendorId(vendorId);
    if (!existing) return 80;

    const tradingScore = Number(existing.tradingPerformance);
    const inactiveDays = existing.inactiveDays;

    let score = tradingScore;
    if (inactiveDays >= INACTIVITY_THRESHOLD_DAYS) {
      const months = Math.floor(inactiveDays / 30);
      const penalty = months * INACTIVITY_PENALTY_PER_MONTH;
      score = Math.max(0, score - penalty);
    }

    return Math.min(100, score);
  }

  /**
   * XP sadakati hesabı — cüzdandaki XP miktarı
   */
  private async calculateXpLoyalty(vendorId: string): Promise<number> {
    const vendor = await this.vendorRepo.findById(vendorId);
    if (!vendor) return 50;

    const userId = vendor.userId;
    if (!userId) return 50;

    // UserLevel'dan XP çek — şimdilik basit placeholder
    // Gerçek implementasyonda IUserLevelRepository kullanılacak
    const existing = await this.trustScoreRepo.findByVendorId(vendorId);
    const currentXp = 0; // TODO: UserLevel'dan çek

    if (currentXp <= 0) {
      const currentLoyalty = Number(existing?.xpLoyalty ?? 100);
      return Math.max(0, currentLoyalty - LOW_XP_PENALTY_PER_MONTH);
    }

    return Math.min(100, Math.round((currentXp / 500) * 100));
  }

  /**
   * Uyumluluk skoru — aktif ihlal sayısına göre
   * Master Plan §3.4: 1. ihlal = uyarı, 2. ihlal = −15 puan, 3. ihlal = dondurma
   */
  private async calculateComplianceScore(vendorId: string): Promise<number> {
    const count = await this.vendorScoreRepo.countActiveViolations(vendorId);

    if (count === 0) return 100;
    if (count === 1) return 100; // WARNING — henüz ceza yok
    if (count === 2) return 85;
    return 0; // 3+ ihlal = dondurulmuş
  }

  /**
   * Vendor freeze kontrolü — 3+ aktif ihlal varsa dondurulmuş sayılır
   */
  async isVendorFrozen(vendorId: string): Promise<boolean> {
    const count = await this.vendorScoreRepo.countActiveViolations(vendorId);
    return count >= 3;
  }
}