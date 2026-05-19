// packages/shared/shared-persistence/src/mongodb/loyalty/loyalty.repository.ts
// Loyalty + Subscription + Marketing repositories
// ADR-005 §9: subscription/XP/referral/menu/voucher repositories

import { Injectable } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { Types } from 'mongoose';

import { Subscription, ISubscription, SubscriptionStatusType } from '../../schemas/backend/subscription.schema';
import { MembershipTier, IMembershipTier, LoyaltyTierType } from '../../schemas/backend/membershipTier.schema';
import { TrustScore, ITrustScore, TrustLevelType } from '../../schemas/backend/trustScore.schema';
import { GiftVoucher, IGiftVoucher, GiftVoucherTypeType } from '../../schemas/backend/giftVoucher.schema';
import { XpTransaction, IXpTransaction, XpTransactionTypeType } from '../../schemas/backend/xpTransaction.schema';
import { Referral, IReferral } from '../../schemas/backend/referral.schema';
import { MenuUsage, IMenuUsage } from '../../schemas/backend/menuUsage.schema';
import { MenuPurchase, IMenuPurchase, MenuPurchaseStatusType } from '../../schemas/backend/menuPurchase.schema';
import { MenuRedemption, IMenuRedemption } from '../../schemas/backend/menuRedemption.schema';

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly connection: Connection) {}

  async findByCompany(companyId: string): Promise<ISubscription | null> {
    return Subscription.findOne({ companyId }).lean();
  }

  async findActiveByCompany(companyId: string): Promise<ISubscription | null> {
    return Subscription.findOne({ companyId, status: 'ACTIVE' }).lean();
  }

  async create(input: {
    companyId: string;
    planName: string;
    priceTL: Types.Decimal128;
    priceBarter: Types.Decimal128;
    listingLimit?: number;
    autoRenew?: boolean;
    endDate?: Date;
  }): Promise<ISubscription> {
    const doc = new Subscription({
      id: new Types.ObjectId().toString(),
      ...input,
      status: 'ACTIVE',
      listingLimit: input.listingLimit ?? 10,
      autoRenew: input.autoRenew ?? true,
      commissionDiscount: Types.Decimal128.fromString('0'),
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async updateStatus(id: string, status: SubscriptionStatusType): Promise<boolean> {
    const res = await Subscription.updateOne(
      { _id: id },
      { $set: { status, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async expireOldSubscriptions(): Promise<number> {
    const res = await Subscription.updateMany(
      { status: 'ACTIVE', endDate: { $lt: new Date() } },
      { $set: { status: 'EXPIRED', updatedAt: new Date() } }
    );
    return res.modifiedCount;
  }
}

@Injectable()
export class MembershipTierRepository {
  constructor(private readonly connection: Connection) {}

  async findByTier(tier: LoyaltyTierType): Promise<IMembershipTier | null> {
    return MembershipTier.findOne({ tier }).lean();
  }

  async findAll(): Promise<IMembershipTier[]> {
    return MembershipTier.find().sort({ minXp: 1 }).lean();
  }

  async findByXp(xp: number): Promise<IMembershipTier | null> {
    return MembershipTier.findOne({ minXp: { $lte: xp } }).sort({ minXp: -1 }).lean();
  }

  async upsertTier(input: { tier: LoyaltyTierType; minXp: number; description?: string; rewardMultiplier: Types.Decimal128 }): Promise<IMembershipTier> {
    const existing = await MembershipTier.findOne({ tier: input.tier });
    if (existing) {
      await MembershipTier.updateOne(
        { _id: existing._id },
        { $set: { minXp: input.minXp, description: input.description, rewardMultiplier: input.rewardMultiplier } }
      );
      const updated = await MembershipTier.findOne({ tier: input.tier });
      return updated!;
    }
    const doc = new MembershipTier({
      id: new Types.ObjectId().toString(),
      tier: input.tier,
      minXp: input.minXp,
      description: input.description,
      rewardMultiplier: input.rewardMultiplier,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }
}

@Injectable()
export class TrustScoreRepository {
  constructor(private readonly connection: Connection) {}

  async findByVendor(vendorId: string): Promise<ITrustScore | null> {
    return TrustScore.findOne({ vendorId }).lean();
  }

  async create(input: { vendorId: string; level?: TrustLevelType }): Promise<ITrustScore> {
    const doc = new TrustScore({
      id: new Types.ObjectId().toString(),
      vendorId: input.vendorId,
      level: input.level ?? 'GOOD',
      score: Types.Decimal128.fromString('100'),
      tradingPerformance: Types.Decimal128.fromString('100'),
      xpLoyalty: Types.Decimal128.fromString('100'),
      compliance: Types.Decimal128.fromString('100'),
      isFrozen: false,
      violationCount: 0,
      inactiveDays: 0,
      lastCalculatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async updateScore(vendorId: string, updates: {
    score?: Types.Decimal128;
    tradingPerformance?: Types.Decimal128;
    xpLoyalty?: Types.Decimal128;
    compliance?: Types.Decimal128;
    level?: TrustLevelType;
    violationCount?: number;
    inactiveDays?: number;
  }): Promise<boolean> {
    const setFields: Record<string, unknown> = { lastCalculatedAt: new Date(), updatedAt: new Date() };
    if (updates.score) setFields.score = updates.score;
    if (updates.tradingPerformance) setFields.tradingPerformance = updates.tradingPerformance;
    if (updates.xpLoyalty) setFields.xpLoyalty = updates.xpLoyalty;
    if (updates.compliance) setFields.compliance = updates.compliance;
    if (updates.level) setFields.level = updates.level;
    if (updates.violationCount !== undefined) setFields.violationCount = updates.violationCount;
    if (updates.inactiveDays !== undefined) setFields.inactiveDays = updates.inactiveDays;

    const res = await TrustScore.updateOne({ vendorId }, { $set: setFields });
    return res.modifiedCount > 0;
  }

  async freezeVendor(vendorId: string): Promise<boolean> {
    const res = await TrustScore.updateOne(
      { vendorId },
      { $set: { isFrozen: true, level: 'FROZEN', updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class GiftVoucherRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    userId: string;
    code: string;
    type: GiftVoucherTypeType;
    amount: Types.Decimal128;
    validUntil: Date;
    issuedBy?: string;
  }): Promise<IGiftVoucher> {
    const doc = new GiftVoucher({
      id: new Types.ObjectId().toString(),
      ...input,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByCode(code: string): Promise<IGiftVoucher | null> {
    return GiftVoucher.findOne({ code }).lean();
  }

  async findByUser(userId: string, activeOnly = true): Promise<IGiftVoucher[]> {
    const query: Record<string, unknown> = { userId };
    if (activeOnly) {
      query.redeemedAt = { $eq: null };
      query.validUntil = { $gt: new Date() };
    }
    return GiftVoucher.find(query).sort({ createdAt: -1 }).lean();
  }

  async redeem(id: string, orderId: string): Promise<boolean> {
    const res = await GiftVoucher.updateOne(
      { _id: id, redeemedAt: null, validUntil: { $gt: new Date() } },
      { $set: { redeemedAt: new Date(), orderId, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class XpTransactionRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    userId: string;
    amount: number;
    type: XpTransactionTypeType;
    description?: string;
    referenceId?: string;
    referenceType?: string;
    expiresAt?: Date;
  }): Promise<IXpTransaction> {
    const doc = new XpTransaction({
      id: new Types.ObjectId().toString(),
      ...input,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByUser(userId: string, limit = 100): Promise<IXpTransaction[]> {
    return XpTransaction.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async sumByUser(userId: string): Promise<number> {
    const result = await XpTransaction.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async expireOldTransactions(): Promise<number> {
    const res = await XpTransaction.updateMany(
      { expiresAt: { $lt: new Date() }, erodedAt: null },
      { $set: { erodedAt: new Date(), updatedAt: new Date() } }
    );
    return res.modifiedCount;
  }
}

@Injectable()
export class ReferralRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: { referrerId: string; refereeId: string; referralCode: string; xpGranted?: number }): Promise<IReferral> {
    const doc = new Referral({
      id: new Types.ObjectId().toString(),
      ...input,
      xpGranted: input.xpGranted ?? 0,
      bonusGranted: false,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByReferrer(referrerId: string): Promise<IReferral[]> {
    return Referral.find({ referrerId }).sort({ createdAt: -1 }).lean();
  }

  async findByReferee(refereeId: string): Promise<IReferral | null> {
    return Referral.findOne({ refereeId }).lean();
  }

  async grantReward(id: string): Promise<boolean> {
    const res = await Referral.updateOne(
      { _id: id, bonusGranted: false },
      { $set: { bonusGranted: true, rewardGrantedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async countByReferrer(referrerId: string): Promise<number> {
    return Referral.countDocuments({ referrerId });
  }
}

@Injectable()
export class MenuUsageRepository {
  constructor(private readonly connection: Connection) {}

  async upsertUsage(subscriptionId: string, month: number, year: number, usedCredit: Types.Decimal128, totalCredit: Types.Decimal128): Promise<void> {
    await MenuUsage.findOneAndUpdate(
      { subscriptionId, month, year },
      {
        $set: {
          usedCredit,
          totalCredit,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  async getUsage(subscriptionId: string, month: number, year: number): Promise<IMenuUsage | null> {
    return MenuUsage.findOne({ subscriptionId, month, year }).lean();
  }
}

@Injectable()
export class MenuPurchaseRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    userId: string;
    listingId: string;
    paidAmount: Types.Decimal128;
    serviceFee: Types.Decimal128;
    vatAmount: Types.Decimal128;
    qrCode: string;
    qrExpiresAt: Date;
    subscriptionId?: string;
    xpEarned?: number;
  }): Promise<IMenuPurchase> {
    const doc = new MenuPurchase({
      id: new Types.ObjectId().toString(),
      ...input,
      status: 'PENDING',
      xpEarned: input.xpEarned ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async markCompleted(id: string): Promise<boolean> {
    const res = await MenuPurchase.updateOne(
      { _id: id, status: 'PENDING' },
      { $set: { status: 'COMPLETED', updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async findByUser(userId: string, limit = 50): Promise<IMenuPurchase[]> {
    return MenuPurchase.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async findByQrCode(qrCode: string): Promise<IMenuPurchase | null> {
    return MenuPurchase.findOne({ qrCode }).lean();
  }
}

@Injectable()
export class MenuRedemptionRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: { purchaseId: string; isOneFree: boolean; scannedByStaff?: string }): Promise<IMenuRedemption> {
    const doc = new MenuRedemption({
      id: new Types.ObjectId().toString(),
      ...input,
      redeemedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByPurchase(purchaseId: string): Promise<IMenuRedemption | null> {
    return MenuRedemption.findOne({ purchaseId }).lean();
  }
}