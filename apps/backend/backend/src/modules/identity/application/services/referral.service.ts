// apps/backend/src/modules/identity/application/services/referral.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IReferralRepository } from '../../domain/repositories/referral.repository.interface';
import { GrantReferralRewardCommand } from '../commands/grant-referral-reward.command';
import { randomBytes } from 'crypto';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('IReferralRepository') private readonly referralRepo: IReferralRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async generateReferralCode(userId: string): Promise<string> {
    const code = 'BZX' + randomBytes(3).toString('hex').toUpperCase();
    await this.userRepo.updateReferralCode(userId, code);
    return code;
  }

  async processReferral(refereeId: string, referralCode: string): Promise<boolean> {
    const referrer = await this.userRepo.findByReferralCode(referralCode);

    if (!referrer || referrer.id === refereeId) return false;

    const reverseRef = await this.referralRepo.findReverseReferral(referrer.id, refereeId);
    if (reverseRef) {
      this.logger.warn('Karşılıklı referans denemesi engellendi', { referrerId: referrer.id, refereeId });
      return false;
    }

    const existing = await this.referralRepo.findByReferee(refereeId);
    if (existing) return false;

    await this.referralRepo.create({ referrerId: referrer.id, refereeId, referralCode });

    await this.commandBus.execute(new GrantReferralRewardCommand(referrer.id, refereeId));

    this.logger.log('Referral işlendi', { referrerId: referrer.id, refereeId });
    return true;
  }

  async getReferralStats(userId: string) {
    const [referrals, user] = await Promise.all([
      this.referralRepo.findByReferrer(userId),
      this.userRepo.findById(userId),
    ]);

    const completedCount = referrals.filter(r => r.rewardGrantedAt !== null).length;

    return {
      referralCode:   user?.referralCode,
      totalReferrals: referrals.length,
      completed:      completedCount,
      remaining:      Math.max(0, 3 - completedCount),
      hasThirdBonus:  completedCount >= 3,
      referrals:      referrals.map(r => ({
        refereeId:    r.refereeId,
        xpEarned:     r.xpGranted,
        bonusGranted: r.bonusGranted,
        completedAt:  r.rewardGrantedAt,
        joinedAt:     r.createdAt,
      })),
    };
  }
}