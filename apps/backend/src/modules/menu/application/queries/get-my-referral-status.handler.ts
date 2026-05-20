// apps/backend/src/modules/menu/application/queries/get-my-referral-status.handler.ts
// BazarX-GO §7 — Kullanıcının referans durumunu ve bonus hakkını döndür

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGoReferral, IUserSubscription } from '@barterborsa/shared-persistence';
import { REFERRAL_RIGHTS_PER_MONTH, calculateReferralBonus, REFERRAL_BONUS_TTL_DAYS } from '../../domain/referral-bonus.constants';

export class GetMyReferralStatusQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetMyReferralStatusQuery)
export class GetMyReferralStatusHandler implements IQueryHandler<GetMyReferralStatusQuery> {
  constructor(
    @InjectModel('GoReferral')      private readonly referralModel: Model<IGoReferral>,
    @InjectModel('UserSubscription')private readonly subModel:      Model<IUserSubscription>,
  ) {}

  async execute(query: GetMyReferralStatusQuery) {
    const { userId } = query;

    // Kullanıcının referans kodu (deterministik — userId'den türetilir)
    const referralCode = `GO-${userId.slice(-8).toUpperCase()}`;

    // Bu kullanıcının referansladığı kişiler (en yeni → en eski)
    const referrals = await this.referralModel
      .find({ referrerId: userId })
      .sort({ createdAt: -1 })
      .lean<IGoReferral[]>();

    // Abonelik ay sayısını hesapla (hak sayısı için)
    const sub = await this.subModel.findOne({ userId, status: 'ACTIVE' }).lean();
    const subscriptionStartDate = sub?.createdAt ? new Date(sub.createdAt) : new Date();
    const monthsActive = Math.max(1, Math.round(
      (Date.now() - subscriptionStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    ));

    // Toplam referans hakkı = 3 (1. ay) + 1 × (sonraki aylar)
    const totalRights = 3 + Math.max(0, monthsActive - 1);
    const usedRights  = referrals.length;
    const remaining   = Math.max(0, totalRights - usedRights);

    // 3. referans bonus durumu
    const bonusReferral   = referrals.find(r => r.isBonusTrigger);
    const bonusGranted    = !!bonusReferral?.bonusPurchaseId;
    const bonusExpired    = bonusReferral?.status === 'BONUS_EXPIRED';
    const bonusExpiresAt  = bonusReferral?.bonusExpiresAt;

    // Sonraki bonus için gereken simülasyon
    let nextBonusPreview: { total: number; bonusTier: string; bonusCategory: number } | null = null;
    if (!bonusGranted && referrals.length > 0) {
      const amounts = referrals.map(r =>
        parseFloat((r.refereePaidAmount as unknown as { toString(): string })?.toString() ?? '0')
      );
      // Son 3'ü al (veya mevcut tüm)
      const last3 = amounts.slice(-3);
      if (last3.length > 0) {
        const preview = calculateReferralBonus([...last3, 199]); // en düşük tier tahmini
        nextBonusPreview = { total: preview.total, bonusTier: preview.bonusTier, bonusCategory: preview.bonusCategory };
      }
    }

    return {
      referralCode,
      referralUrl: `/bazarx-go/referral?code=${referralCode}`,
      stats: {
        totalRights,
        usedRights,
        remaining,
        referrals: referrals.map(r => ({
          refereeId:   r.refereeId,
          tier:        r.refereeTier,
          xpEarned:   r.xpGrantedToReferrer,
          isBonus:    r.isBonusTrigger,
          date:       r.createdAt,
        })),
      },
      bonus: {
        granted:         bonusGranted,
        expired:         bonusExpired,
        expiresAt:       bonusExpiresAt ?? null,
        purchaseId:      bonusReferral?.bonusPurchaseId ?? null,
        bonusCategory:   bonusReferral?.bonusMenuCategory ?? null,
        bonusTtlDays:    REFERRAL_BONUS_TTL_DAYS,
        nextBonusNeeds:  Math.max(0, 3 - referrals.length),  // kaç referans daha
        nextBonusPreview,
      },
    };
  }
}
