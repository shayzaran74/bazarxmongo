// apps/backend/src/modules/identity/application/commands/grant-referral-reward.handler.ts
// Master Plan v4.3 §2.6 — Tek katmanlı referans sistemi

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types, ClientSession } from 'mongoose';
import { CommandBus } from '@nestjs/cqrs';
import { IReferral, IUserLevel, IXpTransaction, IUserSubscription } from '@barterborsa/shared-persistence';
import { GrantReferralRewardCommand } from './grant-referral-reward.command';
import { IssueGiftVoucherCommand } from '../../../marketing/application/commands/issue-gift-voucher.command';

const XP_REFERRAL_GIVEN    = 20;
const XP_REFERRAL_RECEIVED = 10;

@CommandHandler(GrantReferralRewardCommand)
export class GrantReferralRewardHandler implements ICommandHandler<GrantReferralRewardCommand> {
  private readonly logger = new Logger(GrantReferralRewardHandler.name);

  constructor(
    @InjectModel('Referral')         private readonly referralModel:     Model<IReferral>,
    @InjectModel('UserLevel')        private readonly userLevelModel:    Model<IUserLevel>,
    @InjectModel('XpTransaction')    private readonly xpTxModel:         Model<IXpTransaction>,
    @InjectModel('UserSubscription') private readonly subscriptionModel: Model<IUserSubscription>,
    @InjectConnection()              private readonly connection:         Connection,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: GrantReferralRewardCommand) {
    const { referrerId, refereeId } = command;

    const referralCount = await this.referralModel.countDocuments({
      referrerId,
      rewardGrantedAt: { $ne: null, $exists: true },
    });

    if (referralCount >= 3) {
      this.logger.warn('Maksimum referans sınırına ulaşıldı', { referrerId });
      return { success: false, message: 'Maksimum 3 referans hakkı kullanılabilir' };
    }

    const isThirdReferral = referralCount === 2;

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.referralModel.updateOne(
          { refereeId },
          { $set: { xpGranted: XP_REFERRAL_GIVEN, rewardGrantedAt: new Date(), bonusGranted: isThirdReferral } },
          { session },
        );

        await this.upsertUserLevel(referrerId, XP_REFERRAL_GIVEN, session);
        await this.createXpTx(referrerId, XP_REFERRAL_GIVEN, 'REFERRAL_GIVEN',
          `Referans ödülü (${referralCount + 1}. kişi)`, refereeId, session);

        await this.upsertUserLevel(refereeId, XP_REFERRAL_RECEIVED, session);
        await this.createXpTx(refereeId, XP_REFERRAL_RECEIVED, 'REFERRAL_RECEIVED',
          'Referans karşılama bonusu', referrerId, session);
      });
    } finally {
      await session.endSession();
    }

    if (isThirdReferral) {
      await this.subscriptionModel.updateMany(
        { userId: referrerId, status: 'ACTIVE' },
        { $set: { referralDiscountPct: Types.Decimal128.fromString('20') } },
      );
      await this.commandBus.execute(
        new IssueGiftVoucherCommand(referrerId, 100, 'REFERRAL_BONUS', 'SYSTEM', 60),
      );
      this.logger.log('3. referans bonusu verildi', { referrerId });
    }

    this.logger.log('Referans ödülleri verildi', { referrerId, refereeId, isThirdReferral });
    return {
      success: true,
      data: {
        xpForReferrer: XP_REFERRAL_GIVEN,
        xpForReferee:  XP_REFERRAL_RECEIVED,
        thirdReferralBonus: isThirdReferral,
        totalReferrals: referralCount + 1,
      },
    };
  }

  private async upsertUserLevel(userId: string, xp: number, session: ClientSession): Promise<void> {
    const existing = await this.userLevelModel.findOne({ userId }).session(session).lean();
    if (existing) {
      await this.userLevelModel.updateOne(
        { userId },
        { $inc: { currentXp: xp, lifetimeXp: xp } },
        { session },
      );
    } else {
      const newId = new Types.ObjectId().toString();
      await this.userLevelModel.create(
        [{ _id: newId, id: newId, userId, currentXp: xp, lifetimeXp: xp, level: 1, isFirstOrder: true }],
        { session },
      );
    }
  }

  private async createXpTx(
    userId: string, amount: number, type: string,
    description: string, referenceId: string, session: ClientSession,
  ): Promise<void> {
    const newId = new Types.ObjectId().toString();
    await this.xpTxModel.create(
      [{ _id: newId, id: newId, userId, amount, type, description, referenceId, referenceType: 'USER' }],
      { session },
    );
  }
}
