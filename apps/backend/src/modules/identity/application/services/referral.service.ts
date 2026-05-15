// apps/backend/src/modules/identity/application/services/referral.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CommandBus } from '@nestjs/cqrs';
import { GrantReferralRewardCommand } from '../commands/grant-referral-reward.command';
import { randomBytes } from 'crypto';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    private readonly prisma:     PrismaService,
    private readonly commandBus: CommandBus,
  ) {}

  // Yeni kullanıcı için benzersiz referral kodu üret
  async generateReferralCode(userId: string): Promise<string> {
    const code = 'BZX' + randomBytes(3).toString('hex').toUpperCase();
    await this.prisma.user.update({
      where: { id: userId },
      data:  { referralCode: code },
    });
    return code;
  }

  // Yeni kullanıcı kayıt sırasında referral kodu işle
  // Master Plan v4.3 §2.6 / §3.4 — Tek katmanlı referans:
  //   - Bir kullanıcı yalnızca bir kez referans edilebilir (refereeId @unique)
  //   - Karşılıklı (circular) referans yasak: A → B varsa B → A engellenir
  //   - Ödül yalnızca DOĞRUDAN referrer'a verilir; zincirleme komisyon yoktur
  async processReferral(refereeId: string, referralCode: string): Promise<boolean> {
    const referrer = await this.prisma.user.findUnique({
      where:  { referralCode },
      select: { id: true },
    });

    if (!referrer || referrer.id === refereeId) return false;

    // Tek seviye guard — A→B varsa B→A engellenir
    const reverseRef = await this.prisma.referral.findFirst({
      where: { referrerId: refereeId, refereeId: referrer.id },
      select: { id: true },
    });
    if (reverseRef) {
      this.logger.warn('Karşılıklı referans denemesi engellendi', {
        referrerId: referrer.id,
        refereeId,
      });
      return false;
    }

    // Zaten referral kaydı var mı?
    const existing = await this.prisma.referral.findUnique({ where: { refereeId } });
    if (existing) return false;

    // Referral kaydını oluştur (henüz ödül verilmedi)
    await this.prisma.referral.create({
      data: {
        referrerId:  referrer.id,
        refereeId,
        referralCode,
      },
    });

    // Ödül verme — ilk sipariş sonrası tetiklenir (isFirstOrder=false olunca)
    // Bunu isFirstOrder=false olduğunda event ile tetikleyeceğiz (Faz 2)
    // Şimdilik anında ver (30 gün ücretsiz deneme sonrası)
    await this.commandBus.execute(
      new GrantReferralRewardCommand(referrer.id, refereeId),
    );

    this.logger.log('Referral işlendi', { referrerId: referrer.id, refereeId });
    return true;
  }

  // Kullanıcının referral istatistikleri
  async getReferralStats(userId: string) {
    const [referrals, code] = await Promise.all([
      this.prisma.referral.findMany({
        where: { referrerId: userId },
        select: {
          refereeId:       true,
          xpGranted:       true,
          bonusGranted:    true,
          rewardGrantedAt: true,
          createdAt:       true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.findUnique({
        where:  { id: userId },
        select: { referralCode: true },
      }),
    ]);

    const completedCount = referrals.filter((r) => r.rewardGrantedAt !== null).length;

    return {
      referralCode:   code?.referralCode,
      totalReferrals: referrals.length,
      completed:      completedCount,
      remaining:      Math.max(0, 3 - completedCount),
      hasThirdBonus:  completedCount >= 3,
      referrals:      referrals.map((r) => ({
        refereeId:    r.refereeId,
        xpEarned:     r.xpGranted,
        bonusGranted: r.bonusGranted,
        completedAt:  r.rewardGrantedAt,
        joinedAt:     r.createdAt,
      })),
    };
  }
}
