// apps/backend/src/modules/menu/application/services/menu-rights.service.ts
// Master Plan v4.3 §2.2 + §2.7 — Kullanıcı menü hakkı yönetimi.
// Her tier için: totalAllowance = aidat × 2
// Yükseltme: yeni hak verilir (UPGRADE), eski hak deaktive edilir.
// Düşürme: yeni hak verilir (UPGRADE), eski hak 30 gün geçerli kalır (DOWNGRADE_GRACE).

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IMenuRight, MenuRightTierType, MenuRightSourceType } from '@barterborsa/shared-persistence';
import { SubscriptionTier, SUBSCRIPTION_FEES } from '../../../loyalty/domain/enums/loyalty.enums';

// Master Plan §2.7 — Downgrade koruma süresi (gün)
export const DOWNGRADE_GRACE_DAYS = 30;
// Master Plan §2.2 — Menü hakkı çarpanı (aidat × 2)
export const MENU_RIGHT_MULTIPLIER = 2;

@Injectable()
export class MenuRightsService {
  private readonly logger = new Logger(MenuRightsService.name);

  constructor(
    @InjectModel('MenuRight') private readonly menuRightModel: Model<IMenuRight>,
  ) {}

  /**
   * Tier yükseltme/düşürme sonrası menü hakkını yeniden hesaplar.
   * - Yeni hak: aidat × 2 (UPGRADE) — 1 ay geçerli (sonraki ödemeye kadar).
   * - Eski hak: ya deaktive edilir (yükseltme), ya 30 gün korunur (düşürme).
   *
   * Master Plan §2.7 Downgrade koruma kuralı.
   */
  async recalculateForTier(
    userId: string,
    newTier: SubscriptionTier,
    isDowngrade: boolean,
    session?: ClientSession,
  ): Promise<{ newRightId: string; graceRightId?: string }> {
    const now = new Date();
    const aidat = SUBSCRIPTION_FEES[newTier];
    if (!aidat) {
      throw new Error(`Bilinmeyen tier: ${newTier}`);
    }
    const allowance = aidat * MENU_RIGHT_MULTIPLIER;

    // Mevcut aktif hakları al
    const activeRights = await this.menuRightModel.find({
      userId,
      isActive: true,
    }).session(session ?? null);

    let graceRightId: string | undefined;
    for (const right of activeRights) {
      if (isDowngrade) {
        // Master Plan §2.7 — Eski hak 30 gün daha geçerli kalır.
        // Kullanılmamış bakiyeyi koruyoruz; süre 30 gün uzatılır.
        const graceUntil = new Date(now.getTime() + DOWNGRADE_GRACE_DAYS * 24 * 60 * 60 * 1000);
        await this.menuRightModel.updateOne(
          { id: right.id },
          {
            $set: {
              source: 'DOWNGRADE_GRACE',
              validUntil: graceUntil,
              isActive: true,
            },
          },
          { session },
        );
        graceRightId = right.id;
      } else {
        // Yükseltme — eski hak hemen deaktive (yeni hak daha avantajlı)
        await this.menuRightModel.updateOne(
          { id: right.id },
          { $set: { isActive: false, validUntil: now } },
          { session },
        );
      }
    }

    // Yeni hak — 1 ay geçerli (sonraki aidat ödemesine kadar)
    const validUntil = new Date(now);
    validUntil.setMonth(validUntil.getMonth() + 1);

    const newRightId = new Types.ObjectId().toString();
    await this.menuRightModel.create([{
      _id: newRightId,
      id: newRightId,
      userId,
      tier: newTier as unknown as MenuRightTierType,
      totalAllowance: Types.Decimal128.fromString(allowance.toFixed(2)),
      usedAllowance: Types.Decimal128.fromString('0'),
      remainingAllowance: Types.Decimal128.fromString(allowance.toFixed(2)),
      source: 'UPGRADE' as MenuRightSourceType,
      validFrom: now,
      validUntil,
      isActive: true,
    }], { session });

    this.logger.log('Menü hakkı yeniden hesaplandı', {
      userId, tier: newTier, allowance, isDowngrade, graceRightId,
    });

    return { newRightId, graceRightId };
  }

  /**
   * Kullanıcının kullanılabilir toplam menü bütçesi (tüm aktif haklardan).
   */
  async getTotalRemainingAllowance(userId: string): Promise<number> {
    const now = new Date();
    const rights = await this.menuRightModel.find({
      userId,
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).lean();
    return rights.reduce((sum, r) => sum + parseFloat(r.remainingAllowance.toString()), 0);
  }
}
