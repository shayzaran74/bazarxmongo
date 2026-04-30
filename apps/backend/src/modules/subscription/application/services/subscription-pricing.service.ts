// apps/backend/src/modules/subscription/application/services/subscription-pricing.service.ts
// Master Plan v4.3 — Abonelik fiyatlandırma ve XP/nakit bölüşüm kuralları

import { Injectable, BadRequestException } from '@nestjs/common';
import { SubscriptionTier, SUBSCRIPTION_FEES } from '../../../loyalty/domain/enums/loyalty.enums';

// Platform hizmet bedeli: %8 + %20 KDV
const SERVICE_RATE = 0.08;
const VAT_RATE     = 0.20;

export interface MenuPriceBreakdown {
  originalPrice:   number;
  discountedPrice: number; // %50 indirimli
  serviceFee:      number; // discounted × %8
  vatAmount:       number; // serviceFee × %20
  totalPaid:       number;
  savings:         number;
}

export interface TierUpgradePayment {
  feeDiff:      number;  // yeni aidat − eski aidat
  cashRequired: number;  // min %50 nakit
  xpAllowed:    number;  // max %50 XP (1 XP = 1₺)
  discountedCash?: number; // 3. referans: nakit pay %40'a düşer
}

@Injectable()
export class SubscriptionPricingService {
  // Menü satın alım fiyat hesabı (Master Plan §2.3)
  calculateMenuPrice(originalPrice: number): MenuPriceBreakdown {
    const discountedPrice = originalPrice * 0.5;
    const serviceFee      = discountedPrice * SERVICE_RATE;
    const vatAmount       = serviceFee * VAT_RATE;
    const totalPaid       = discountedPrice + serviceFee + vatAmount;
    return {
      originalPrice,
      discountedPrice,
      serviceFee:   Math.round(serviceFee * 100) / 100,
      vatAmount:    Math.round(vatAmount * 100) / 100,
      totalPaid:    Math.round(totalPaid * 100) / 100,
      savings:      Math.round((originalPrice - totalPaid) * 100) / 100,
    };
  }

  // Tier yükseltme ödeme bölüşümü (Master Plan §2.7)
  calculateUpgradePayment(
    fromTier: SubscriptionTier,
    toTier:   SubscriptionTier,
    hasThirdReferralBonus: boolean = false,
  ): TierUpgradePayment {
    const fromFee = SUBSCRIPTION_FEES[fromTier];
    const toFee   = SUBSCRIPTION_FEES[toTier];

    if (toFee <= fromFee) {
      throw new BadRequestException('Hedef kademe mevcut kademeden yüksek olmalıdır');
    }

    const feeDiff = toFee - fromFee;

    // 3. referans bonusu: nakit pay %40, XP pay %60
    const cashRatio = hasThirdReferralBonus ? 0.40 : 0.50;
    const xpRatio   = hasThirdReferralBonus ? 0.60 : 0.50;

    return {
      feeDiff,
      cashRequired:    Math.ceil(feeDiff * cashRatio),
      xpAllowed:       Math.floor(feeDiff * xpRatio),  // 1 XP = 1₺
      discountedCash:  hasThirdReferralBonus ? Math.ceil(feeDiff * 0.40) : undefined,
    };
  }

  // Ciro eşiği kontrolü — tier yükseltme için (5× mevcut aidat)
  isRevenueEligible(monthlyRevenue: number, currentTier: SubscriptionTier): boolean {
    const currentFee = SUBSCRIPTION_FEES[currentTier];
    return monthlyRevenue >= currentFee * 5;
  }

  // Aylık menü kredisi (2× aidat)
  getMonthlyMenuCredit(tier: SubscriptionTier): number {
    return SUBSCRIPTION_FEES[tier] * 2;
  }

  // Tier sıralaması
  getTierIndex(tier: SubscriptionTier): number {
    const order: SubscriptionTier[] = [
      SubscriptionTier.BRONZE_P1, SubscriptionTier.BRONZE_P2,
      SubscriptionTier.SILVER_P1, SubscriptionTier.SILVER_P2,
      SubscriptionTier.GOLD_P1,   SubscriptionTier.GOLD_P2,
      SubscriptionTier.DIAMOND_P1, SubscriptionTier.DIAMOND_P2,
    ];
    return order.indexOf(tier);
  }

  isHigherTier(candidate: SubscriptionTier, current: SubscriptionTier): boolean {
    return this.getTierIndex(candidate) > this.getTierIndex(current);
  }
}
