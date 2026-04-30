// apps/backend/src/modules/identity/application/commands/grant-referral-reward.handler.ts
// Master Plan v4.3 §2.6 — Tek katmanlı referans sistemi

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GrantReferralRewardCommand } from './grant-referral-reward.command';
import { CommandBus } from '@nestjs/cqrs';
import { IssueGiftVoucherCommand } from '../../../marketing/application/commands/issue-gift-voucher.command';

const XP_REFERRAL_GIVEN    = 20;  // Referans verene (max 3 kişi)
const XP_REFERRAL_RECEIVED = 10;  // Yeni üyeye karşılama bonusu

@CommandHandler(GrantReferralRewardCommand)
export class GrantReferralRewardHandler implements ICommandHandler<GrantReferralRewardCommand> {
  private readonly logger = new Logger(GrantReferralRewardHandler.name);

  constructor(
    private readonly prisma:      PrismaService,
    private readonly commandBus:  CommandBus,
  ) {}

  async execute(command: GrantReferralRewardCommand) {
    const { referrerId, refereeId } = command;

    // Kaç referans verilmiş?
    const referralCount = await this.prisma.referral.count({
      where: { referrerId, rewardGrantedAt: { not: null } },
    });

    if (referralCount >= 3) {
      this.logger.warn('Maksimum referans sınırına ulaşıldı', { referrerId });
      return { success: false, message: 'Maksimum 3 referans hakkı kullanılabilir' };
    }

    const isThirdReferral = referralCount === 2; // Bu işlem sonrası 3. olacak

    await this.prisma.$transaction(async (tx) => {
      // Referans kaydını güncelle
      await tx.referral.update({
        where:  { refereeId },
        data: {
          xpGranted:       XP_REFERRAL_GIVEN,
          rewardGrantedAt: new Date(),
          bonusGranted:    isThirdReferral,
        },
      });

      // Referans verene +20 XP
      await tx.userLevel.upsert({
        where:  { userId: referrerId },
        update: { currentXp: { increment: XP_REFERRAL_GIVEN }, lifetimeXp: { increment: XP_REFERRAL_GIVEN } },
        create: { userId: referrerId, currentXp: XP_REFERRAL_GIVEN, lifetimeXp: XP_REFERRAL_GIVEN, level: 1, isFirstOrder: true },
      });
      await tx.xpTransaction.create({
        data: { userId: referrerId, amount: XP_REFERRAL_GIVEN, type: 'REFERRAL_GIVEN',
          description: `Referans ödülü (${referralCount + 1}. kişi)`, referenceId: refereeId, referenceType: 'USER' },
      });

      // Yeni üyeye +10 XP karşılama bonusu
      await tx.userLevel.upsert({
        where:  { userId: refereeId },
        update: { currentXp: { increment: XP_REFERRAL_RECEIVED }, lifetimeXp: { increment: XP_REFERRAL_RECEIVED } },
        create: { userId: refereeId, currentXp: XP_REFERRAL_RECEIVED, lifetimeXp: XP_REFERRAL_RECEIVED, level: 1, isFirstOrder: true },
      });
      await tx.xpTransaction.create({
        data: { userId: refereeId, amount: XP_REFERRAL_RECEIVED, type: 'REFERRAL_RECEIVED',
          description: 'Referans karşılama bonusu', referenceId: referrerId, referenceType: 'USER' },
      });
    });

    // 3. referans özel bonusu: 1+1 menü hakkı + tier geçişinde %20 indirim işareti
    if (isThirdReferral) {
      // Referans indirimini aboneliğe kaydet
      await this.prisma.userSubscription.updateMany({
        where: { userId: referrerId, status: 'ACTIVE' },
        data:  { referralDiscountPct: 20 },
      });

      // 1+1 menü hakkı olarak hediye çeki ver (100₺ — bir alt tier menü değeri)
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
}
