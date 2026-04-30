// apps/backend/src/modules/barter/application/services/trust-score-calculator.service.ts
// Master Plan v4.3 §3.3 — TrustScore Algoritması

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Decimal } from 'decimal.js';

// Ağırlıklar (toplam: %100)
const WEIGHT_TRADING    = 0.40; // Ticari performans
const WEIGHT_XP_LOYALTY = 0.30; // XP sadakati
const WEIGHT_COMPLIANCE = 0.30; // Uyumluluk

// Ceza eşikleri
const INACTIVITY_THRESHOLD_DAYS   = 90;
const INACTIVITY_PENALTY_PER_MONTH = 10;
const LOW_XP_PENALTY_PER_MONTH     = 5;

export interface TrustScoreComponents {
  trading:    number; // 0–100
  xpLoyalty:  number;
  compliance: number;
  overall:    number;
}

@Injectable()
export class TrustScoreCalculatorService {
  private readonly logger = new Logger(TrustScoreCalculatorService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Tek bir vendor için TrustScore hesapla ve kaydet
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

    await this.prisma.trustScore.upsert({
      where:  { vendorId },
      create: { vendorId, score: overall, tradingPerformance: trading, xpLoyalty, compliance },
      update: { score: overall, tradingPerformance: trading, xpLoyalty, compliance, lastCalculatedAt: new Date() },
    });

    this.logger.debug('TrustScore güncellendi', { vendorId, overall, trading, xpLoyalty, compliance });
    return { trading, xpLoyalty, compliance, overall };
  }

  // Ticari performans (% 40): tamamlanan takas / başlatılan takas
  private async calculateTradingPerformance(vendorId: string): Promise<number> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, companyId: true },
    });
    if (!vendor) return 50;

    // Vendor doğrudan companyId alanına sahip
    const company = vendor.companyId ? { id: vendor.companyId } : null;

    if (!company) return 80; // Şirket kayıtlı değilse başlangıç skoru

    const [total, completed] = await Promise.all([
      this.prisma.tradeOffer.count({
        where: { OR: [{ fromCompanyId: company.id }, { toCompanyId: company.id }] },
      }),
      this.prisma.tradeOffer.count({
        where: {
          status: 'COMPLETED',
          OR: [{ fromCompanyId: company.id }, { toCompanyId: company.id }],
        },
      }),
    ]);

    if (total === 0) return 80; // Yeni üye → başlangıç skoru

    // Tamamlanma oranı
    const completionRate = completed / total;
    let score = Math.round(completionRate * 100);

    // 90 gün hareketsizlik cezası
    const existingScore = await this.prisma.trustScore.findUnique({
      where: { vendorId },
      select: { inactiveDays: true },
    });
    const inactiveDays = existingScore?.inactiveDays ?? 0;

    if (inactiveDays >= INACTIVITY_THRESHOLD_DAYS) {
      const months  = Math.floor(inactiveDays / 30);
      const penalty = months * INACTIVITY_PENALTY_PER_MONTH;
      score         = Math.max(0, score - penalty);
    }

    return Math.min(100, score);
  }

  // XP sadakati (%30): cüzdandaki XP bakiyesi / son 3 aylık takas hacmi
  private async calculateXpLoyalty(vendorId: string): Promise<number> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { userId: true },
    });
    if (!vendor?.userId) return 50;

    const xpBalance = await this.prisma.userLevel.findUnique({
      where: { userId: vendor.userId },
      select: { currentXp: true },
    });

    if (!xpBalance || xpBalance.currentXp <= 0) {
      // Bakiye sıfır → ceza uygulanır ama skoru önceki değerden düşür
      return 50;
    }

    // XP bakiyesi > 500 → tam puan, daha az → orantılı
    const score = Math.min(100, Math.round((xpBalance.currentXp / 500) * 100));

    // Düşük XP cezası
    const existingScore = await this.prisma.trustScore.findUnique({
      where: { vendorId },
      select: { xpLoyalty: true },
    });
    const currentLoyalty = existingScore ? Number(existingScore.xpLoyalty) : 100;

    if (xpBalance.currentXp === 0) {
      return Math.max(0, currentLoyalty - LOW_XP_PENALTY_PER_MONTH);
    }

    return score;
  }

  // Uyumluluk (%30): ihlal geçmişine göre hesap
  private async calculateCompliance(vendorId: string): Promise<number> {
    const score = await this.prisma.trustScore.findUnique({
      where: { vendorId },
      select: { violationCount: true, compliance: true },
    });

    if (!score) return 100; // Yeni üye → tam uyumluluk

    const violations = score.violationCount;
    let complianceScore = 100;

    if (violations >= 3) {
      // 3+ ihlal: dondurma (compliance 0, önceki adımda isFrozen=true yapılır)
      complianceScore = 0;
    } else if (violations === 2) {
      complianceScore = 85; // −15 puan
    }
    // 1 ihlal: sadece uyarı, puan düşmez

    return complianceScore;
  }
}
