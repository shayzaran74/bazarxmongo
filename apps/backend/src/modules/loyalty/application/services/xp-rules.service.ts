// apps/backend/src/modules/loyalty/application/services/xp-rules.service.ts
// Master Plan v4.3 §2.5 — XP kazanım ve harcama kuralları

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';

// Master Plan XP kazanım tablosu
export const XP_EARNING_RULES = {
  PROFILE_COMPLETE:       5,   // Tek seferlik
  SOCIAL_SHARE:           10,  // Aylık 1 kez (Instagram/FB 3 kişi)
  MENU_QR_USE:            5,   // Her QR kullanımında
  REFERRAL_GIVEN:         20,  // Referans veren (max 3 kişi = 60 XP)
  REFERRAL_RECEIVED:      10,  // Referansla gelen yeni üye (tek seferlik)
  MONTHLY_SPENDING_110:   15,  // Aylık harcama hedefini %110 aşma
} as const;

// XP harcama limitleri (Master Plan §2.5)
const TIER_UPGRADE_MAX_XP_PCT   = 0.50;  // Aidat farkının max %50'si XP ile
const SYSTEM_PAYMENT_MAX_XP_PCT = 0.20;  // İşlem tutarının max %20'si XP ile

// XP → TL: 1 XP = 1 ₺ (tier yükseltmede)
const XP_TO_TL_TIER_UPGRADE = 1.0;

@Injectable()
export class XpRulesService {
  constructor(private readonly prisma: PrismaService) {}

  // İlk işlem kuralı: isFirstOrder=true ise XP kazanılamaz/harcanamaz
  async checkFirstOrderBlock(userId: string): Promise<boolean> {
    const level = await this.prisma.userLevel.findUnique({
      where:  { userId },
      select: { isFirstOrder: true },
    });
    return level?.isFirstOrder ?? true;
  }

  // Tier yükseltmede kullanılabilecek max XP (1XP = 1₺, max %50)
  maxXpForTierUpgrade(feeDiff: number, hasThirdReferral: boolean): number {
    const pct = hasThirdReferral ? 0.60 : TIER_UPGRADE_MAX_XP_PCT;
    return Math.floor(feeDiff * pct);
  }

  // Sistem içi ödemede kullanılabilecek max XP (max %20)
  maxXpForSystemPayment(transactionAmount: number): number {
    return Math.floor(transactionAmount * SYSTEM_PAYMENT_MAX_XP_PCT);
  }

  // Aylık harcama hedefini %110 aşıp aşmadığını kontrol et
  async checkMonthlySpendingBonus(userId: string, currentMonthRevenue: number): Promise<boolean> {
    const subscription = await this.prisma.userSubscription.findUnique({
      where:   { userId },
      include: { plan: true },
    });
    if (!subscription) return false;

    const target = Number(subscription.plan.breakeven) * 1.10;
    return currentMonthRevenue >= target;
  }

  // Bu ay sosyal paylaşım yapıldı mı?
  async hasSocialShareThisMonth(userId: string): Promise<boolean> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await this.prisma.xpTransaction.count({
      where: {
        userId,
        type:      'SOCIAL_SHARE',
        createdAt: { gte: startOfMonth },
      },
    });
    return count > 0;
  }

  // Profil tamamlama XP daha önce verildi mi?
  async hasProfileCompleteXp(userId: string): Promise<boolean> {
    const count = await this.prisma.xpTransaction.count({
      where: { userId, type: 'PROFILE_COMPLETE' },
    });
    return count > 0;
  }

  // Referans XP sınırı (max 3 kişi = 60 XP)
  async canEarnReferralXp(userId: string): Promise<boolean> {
    const count = await this.prisma.xpTransaction.count({
      where: { userId, type: 'REFERRAL_GIVEN' },
    });
    return count < 3;
  }

  // XP erozyon: her ay %10 azalt (6 ay TTL batch'ler için)
  async erodeExpiredBatches(): Promise<number> {
    const now = new Date();
    let totalEroded = 0;

    // 6 ayı geçmiş ve hâlâ aktif batch'leri bul
    const expiredBatches = await this.prisma.xpTransaction.findMany({
      where: {
        expiresAt: { lte: now },
        amount:    { gt: 0 },
        type:      { not: 'ERODED' },
      },
      take: 500,
    });

    for (const batch of expiredBatches) {
      const erosion = Math.ceil(batch.amount * 0.10);
      if (erosion > 0) {
        await this.prisma.xpTransaction.create({
          data: {
            userId:        batch.userId,
            amount:        -erosion,
            type:          'ERODED',
            description:   'Aylık %10 XP erozyonu',
            referenceType: 'XP_EROSION',
          },
        });
        await this.prisma.userLevel.update({
          where: { userId: batch.userId },
          data:  { currentXp: { decrement: erosion } },
        });
        totalEroded += erosion;
      }
    }

    return totalEroded;
  }
}
