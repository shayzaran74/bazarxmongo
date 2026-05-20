// apps/backend/src/modules/menu/application/services/menu-cron.service.ts
// BazarX-GO Sprint 1 — Otomatik zamanlı görevler

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenuPurchase, IMenuReservation, ISurpriseMenu } from '@barterborsa/shared-persistence';
import { GoNotificationService } from './go-notification.service';

@Injectable()
export class MenuCronService {
  private readonly logger = new Logger(MenuCronService.name);

  constructor(
    @InjectModel('MenuPurchase')    private readonly purchaseModel:    Model<IMenuPurchase>,
    @InjectModel('MenuReservation') private readonly reservationModel: Model<IMenuReservation>,
    @InjectModel('SurpriseMenu')    private readonly surpriseModel:    Model<ISurpriseMenu>,
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
   * Ay sonunda kalan allowance'ı sıfırlar (burn).
   * MenuRightsCleanupService zaten bu işi yapıyor, bu cron tetikleyicidir.
   */
  @Cron('55 23 * * *', { name: 'menuRightsBurn', timeZone: 'Europe/Istanbul' })
  async burnMonthlyRights(): Promise<void> {
    this.logger.log('Aylık menü hakkı burn kontrolü başlatıldı');
    // MenuRightsCleanupService.cleanup() çağrısı menu.module.ts üzerinden inject edilecek
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
}
