// apps/backend/src/modules/menu/application/services/menu-cron.service.ts
// BazarX-GO Sprint 1 — Otomatik zamanlı görevler

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenuPurchase, IMenuReservation, ISurpriseMenu, IGoReferral } from '@barterborsa/shared-persistence';
import { GoNotificationService } from './go-notification.service';

@Injectable()
export class MenuCronService {
  private readonly logger = new Logger(MenuCronService.name);

  constructor(
    @InjectModel('MenuPurchase')    private readonly purchaseModel:    Model<IMenuPurchase>,
    @InjectModel('MenuReservation') private readonly reservationModel: Model<IMenuReservation>,
    @InjectModel('SurpriseMenu')    private readonly surpriseModel:    Model<ISurpriseMenu>,
    @InjectModel('GoReferral')      private readonly referralModel:    Model<IGoReferral>,
    private readonly goNotif: GoNotificationService,
  ) {}

  /**
   * §4 Menü Expiry — her gün 09:00
   * Süresi dolan satın alımları EXPIRED olarak işaretler.
   * (43/44/45. gün bildirimi için bildirim servisi entegre edildiğinde genişletilecek)
   */
  @Cron('0 9 * * *', { name: 'menuExpiry', timeZone: 'Europe/Istanbul' })
  async markExpiredPurchases(): Promise<void> {
    const now = new Date();
    const result = await this.purchaseModel.updateMany(
      {
        status:      { $in: ['ACTIVE', 'PARTIALLY_REDEEMED'] },
        qrExpiresAt: { $lt: now },
      },
      { $set: { status: 'EXPIRED' } },
    );
    if (result.modifiedCount > 0) {
      this.logger.log(`${result.modifiedCount} QR EXPIRED olarak işaretlendi`);
    }
  }

  /**
   * §4 Son 3 gün uyarısı — her gün 09:00
   * 43/44/45. günde dolacak QR'lar için bildirim kuyruğuna ekler.
   * Şimdilik log, bildirim entegrasyonu Sprint 4'te eklenir.
   */
  @Cron('0 9 * * *', { name: 'menuExpiryWarning', timeZone: 'Europe/Istanbul' })
  async warnExpiringPurchases(): Promise<void> {
    const now    = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const expiring = await this.purchaseModel.find(
      {
        status:      { $in: ['ACTIVE', 'PARTIALLY_REDEEMED'] },
        qrExpiresAt: { $gte: now, $lte: in3Days },
      },
      { id: 1, userId: 1, qrExpiresAt: 1 },
    ).lean();

    if (expiring.length > 0) {
      this.logger.log(`${expiring.length} QR 3 gün içinde sona eriyor — push+mail gönderiliyor`);
      const now = new Date();
      for (const p of expiring) {
        const daysLeft = Math.ceil((new Date(p.qrExpiresAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        await this.goNotif.notifyMenuExpiry(
          p.userId,
          undefined, // email Sprint 4'te User modeli ile çekilecek
          daysLeft,
          'Menü hakkın',
        );
      }
    }
  }

  /**
   * Menü hakkı ay sonu sıfırlama — her gün 23:55
   * Aylık hak sıfırlama MenuRightsCleanupService.cleanupExpiredRights() tarafından
   * her gece 03:00'da yapılır. Bu tetikleyiciyadır — işlem MenuRightsCleanupService'dedir.
   */
  @Cron('55 23 * * *', { name: 'menuRightsBurn', timeZone: 'Europe/Istanbul' })
  async burnMonthlyRights(): Promise<void> {
    // İşlem MenuRightsCleanupService.cleanupExpiredRights() içinde her gece 03:00'da çalışır.
    this.logger.debug('menuRightsBurn tetikleyicisi — esas işlem MenuRightsCleanupService\'dedir.');
  }

  /**
   * Sürpriz menü günlük kota sıfırlama — her gece 00:01
   */
  @Cron('1 0 * * *', { name: 'surpriseMenuReset', timeZone: 'Europe/Istanbul' })
  async resetSurpriseMenuQuotas(): Promise<void> {
    const result = await this.surpriseModel.updateMany(
      { usedToday: { $gt: 0 } },
      { $set: { usedToday: 0, lastResetAt: new Date() } },
    );
    if (result.modifiedCount > 0) {
      this.logger.log(`${result.modifiedCount} sürpriz menü kotası sıfırlandı`);
    }
  }

  /**
   * Rezervasyon temizliği — her saat
   * 24 saatten uzun PENDING rezervasyonları CANCELLED olarak işaretler.
   */
  @Cron(CronExpression.EVERY_HOUR, { name: 'reservationCleanup' })
  async cancelStalePendingReservations(): Promise<void> {
    const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result    = await this.reservationModel.updateMany(
      { status: 'PENDING', createdAt: { $lt: threshold } },
      { $set: { status: 'CANCELLED', cancelledAt: new Date(), vendorNote: 'Otomatik iptal: 24 saat yanıt gelmedi' } },
    );
    if (result.modifiedCount > 0) {
      this.logger.log(`${result.modifiedCount} rezervasyon otomatik iptal edildi`);
    }
  }

  /**
   * §7 Referans bonus süresi dolumu — her gün 09:00
   * bonusExpiresAt < now olan BONUS_GRANTED kayıtları BONUS_EXPIRED olarak işaretlenir.
   */
  @Cron('0 9 * * *', { name: 'referralBonusExpiry', timeZone: 'Europe/Istanbul' })
  async expireReferralBonuses(): Promise<void> {
    const now = new Date();
    const result = await this.referralModel.updateMany(
      { status: 'BONUS_GRANTED', bonusExpiresAt: { $lt: now } },
      { $set: { status: 'BONUS_EXPIRED' } },
    );
    if (result.modifiedCount > 0) {
      this.logger.log(`${result.modifiedCount} referans bonusu BONUS_EXPIRED olarak işaretlendi`);
    }
  }
}
