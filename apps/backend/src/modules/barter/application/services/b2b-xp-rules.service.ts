// apps/backend/src/modules/barter/application/services/b2b-xp-rules.service.ts
// Master Plan v4.3 §3.3 — B2B XP Harcama Kuralı (50/25/25)

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';

// Kullanım kategorileri ve maksimum oranları
const COMMISSION_SUBSIDY_MAX_PCT  = 0.50;  // Komisyonun max %50'si
const ADVERTISING_MAX_PCT         = 0.25;  // XP bakiyesinin max %25'i
const POOL_DEPOSIT_MAX_PCT        = 0.25;  // XP bakiyesinin max %25'i
const POOL_DEPOSIT_QUOTA_MAX_PCT  = 0.30;  // Kota tutarının max %30'u
const ADVERTISING_TTL_MONTHS      = 6;     // 6 ay kullanılmazsa silinir

export type B2BXpUsageType = 'COMMISSION' | 'ADVERTISING' | 'POOL_DEPOSIT';

export interface B2BXpAllowance {
  type:         B2BXpUsageType;
  maxXp:        number;
  currentXp:    number;
  allowed:      boolean;
  limitReason?: string;
}

@Injectable()
export class B2BXpRulesService {
  constructor(private readonly prisma: PrismaService) {}

  // Kullanım hakkı hesapla
  async calculateAllowance(
    userId:           string,
    type:             B2BXpUsageType,
    commissionAmount?: number, // tip COMMISSION için
    quotaAmount?:      number, // tip POOL_DEPOSIT için
  ): Promise<B2BXpAllowance> {
    const userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
      select: { currentXp: true },
    });
    const currentXp = userLevel?.currentXp ?? 0;

    if (currentXp <= 0) {
      return { type, maxXp: 0, currentXp, allowed: false, limitReason: 'XP bakiyesi sıfır' };
    }

    let maxXp   = 0;
    let allowed = true;
    let reason: string | undefined;

    switch (type) {
      case 'COMMISSION': {
        if (!commissionAmount) throw new BadRequestException('commissionAmount zorunlu');
        maxXp = Math.floor(commissionAmount * COMMISSION_SUBSIDY_MAX_PCT);
        // 1 XP = 1₺ komisyon indirimi, elde edilebilir maksimum
        maxXp = Math.min(maxXp, currentXp);
        break;
      }
      case 'ADVERTISING': {
        maxXp = Math.floor(currentXp * ADVERTISING_MAX_PCT);
        // 6 ay TTL kontrolü — eski reklam harcamalarına bak
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - ADVERTISING_TTL_MONTHS);
        const expiredAd = await this.prisma.xpTransaction.findFirst({
          where: {
            userId,
            type:      'ADVERTISING_XP_SPEND',
            createdAt: { lt: sixMonthsAgo },
          },
        });
        if (expiredAd) {
          reason = `${ADVERTISING_TTL_MONTHS} ay önce kullanılmayan reklam XP'si silindi`;
        }
        break;
      }
      case 'POOL_DEPOSIT': {
        if (!quotaAmount) throw new BadRequestException('quotaAmount zorunlu');
        const balanceLimit = Math.floor(currentXp * POOL_DEPOSIT_MAX_PCT);
        const quotaLimit   = Math.floor(quotaAmount * POOL_DEPOSIT_QUOTA_MAX_PCT);
        maxXp = Math.min(balanceLimit, quotaLimit);
        if (maxXp <= 0) {
          allowed = false;
          reason  = 'Kota tutarının %30 limitine ulaşıldı veya XP bakiyesi yetersiz';
        }
        break;
      }
    }

    return { type, maxXp, currentXp, allowed: allowed && maxXp > 0, limitReason: reason };
  }

  // XP harcama yap (doğrulandıktan sonra)
  async spendXp(userId: string, amount: number, type: B2BXpUsageType, referenceId: string): Promise<void> {
    const expiresAt = type === 'ADVERTISING'
      ? new Date(Date.now() + ADVERTISING_TTL_MONTHS * 30 * 24 * 60 * 60 * 1000)
      : undefined;

    await this.prisma.$transaction([
      this.prisma.userLevel.update({
        where: { userId },
        data:  { currentXp: { decrement: amount } },
      }),
      this.prisma.xpTransaction.create({
        data: {
          userId,
          amount:        -amount,
          type:          `${type}_XP_SPEND`,
          description:   `B2B XP: ${type}`,
          referenceId,
          referenceType: 'B2B_TRANSACTION',
          expiresAt,
        },
      }),
    ]);
  }
}
