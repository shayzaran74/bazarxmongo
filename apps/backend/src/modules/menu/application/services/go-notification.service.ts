// apps/backend/src/modules/menu/application/services/go-notification.service.ts
// BazarX-GO Sprint 4 — Push (FCM) + Mail + DB bildirim orkestrasyonu

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserDeviceToken, INotification } from '@barterborsa/shared-persistence';
import { FcmService } from '../../../communication/infrastructure/push/fcm.service';
import { MailService } from '../../../communication/infrastructure/mail/mail.service';
import { NotificationType } from '../../../communication/domain/enums/notification-type.enum';

interface NotifyOptions {
  userId:   string;
  type:     NotificationType;
  title:    string;
  body:     string;
  email?:   string;         // mail de gönderilecekse
  htmlMail?:string;         // mail HTML içeriği
  link?:    string;
  data?:    Record<string, string>;
  // 22:00-08:00 sessiz saatler koruması
  respectQuietHours?: boolean;
}

function isQuietHour(): boolean {
  const h = new Date().getHours();
  return h >= 22 || h < 8;
}

@Injectable()
export class GoNotificationService {
  private readonly logger = new Logger(GoNotificationService.name);

  constructor(
    @InjectModel('UserDeviceToken') private readonly tokenModel:        Model<IUserDeviceToken>,
    @InjectModel('Notification')    private readonly notificationModel: Model<INotification>,
    private readonly fcm:  FcmService,
    private readonly mail: MailService,
  ) {}

  /**
   * Kullanıcıya push + (opsiyonel) mail + DB bildirim gönder.
   */
  async notify(opts: NotifyOptions): Promise<void> {
    const { userId, type, title, body, email, htmlMail, link, data, respectQuietHours = true } = opts;

    // 1. DB bildirimi (her zaman kaydedilir)
    const notifId = new Types.ObjectId().toString();
    await this.notificationModel.create([{
      _id: notifId, id: notifId,
      userId, type, title, message: body, link: link ?? null,
      isRead: false, metadata: data ?? {},
    }]);

    // 2. Push (sessiz saat kontrolü)
    if (respectQuietHours && isQuietHour()) {
      this.logger.debug(`Sessiz saat — push atlandı: ${userId}`);
    } else {
      const tokens = await this.tokenModel
        .find({ userId, isActive: true }, { fcmToken: 1 })
        .lean<IUserDeviceToken[]>();

      const fcmTokens = tokens.map(t => t.fcmToken).filter(Boolean);
      if (fcmTokens.length > 0) {
        await this.fcm.sendToTokens(fcmTokens, { title, body, data });
      }
    }

    // 3. Mail (opsiyonel)
    if (email && htmlMail) {
      try {
        await this.mail.sendMail(email, title, htmlMail);
      } catch (e: unknown) {
        this.logger.error('Mail gönderilemedi:', e);
      }
    }
  }

  // ── Hazır BazarX-GO bildirimleri ─────────────────────────────────────────

  async notifyMenuExpiry(userId: string, email: string | undefined, daysLeft: number, menuTitle: string): Promise<void> {
    const emoji  = daysLeft === 1 ? '🚨' : daysLeft === 2 ? '⚠️' : '⏰';
    const title  = `${emoji} Menü hakkın ${daysLeft} gün içinde sona eriyor!`;
    const body   = `"${menuTitle}" için QR\'ını kullanmayı unutma.`;

    await this.notify({
      userId, type: NotificationType.MENU_EXPIRY_WARNING,
      title, body,
      email, htmlMail: email ? this.buildExpiryMail(menuTitle, daysLeft) : undefined,
      link: '/bazarx-go/wallet',
      data: { screen: 'wallet', daysLeft: String(daysLeft) },
    });
  }

  async notifyTransferReceived(toUserId: string, email: string | undefined, fromName: string, menuTitle: string): Promise<void> {
    const title = '🎁 Menü hediye edildi!';
    const body  = `${fromName} sana "${menuTitle}" menüsünü gönderdi. QR cüzdanına düştü.`;

    await this.notify({
      userId: toUserId, type: NotificationType.MENU_TRANSFER_RECEIVED,
      title, body,
      email, htmlMail: email ? this.buildTransferMail(fromName, menuTitle) : undefined,
      link: '/bazarx-go/wallet',
      data: { screen: 'wallet' },
    });
  }

  async notifyReservationConfirmed(userId: string, email: string | undefined, restaurantName: string, date: string, timeSlot: string): Promise<void> {
    const title = '✅ Rezervasyonun onaylandı!';
    const body  = `${restaurantName} — ${date}, ${timeSlot}. Sizi bekliyoruz!`;

    await this.notify({
      userId, type: NotificationType.RESERVATION_CONFIRMED,
      title, body,
      email, htmlMail: email ? this.buildReservationMail(restaurantName, date, timeSlot, true) : undefined,
      link: '/bazarx-go/wallet',
    });
  }

  async notifySurpriseMenuNearby(userId: string, restaurantName: string, distanceM: number): Promise<void> {
    const title = '🎁 Yakınında sürpriz menü!';
    const body  = `${Math.round(distanceM)}m mesafede ${restaurantName} seni bekliyor. Kim olduğunu git gör!`;

    await this.notify({
      userId, type: NotificationType.SURPRISE_MENU_NEARBY,
      title, body,
      link: '/bazarx-go',
      data: { screen: 'home', restaurantName },
      respectQuietHours: true,
    });
  }

  // ── Mail HTML şablonları ─────────────────────────────────────────────────

  private buildExpiryMail(menuTitle: string, daysLeft: number): string {
    return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;color:#111">
      <div style="background:#ff6b35;color:#fff;padding:24px;border-radius:16px;text-align:center;margin-bottom:24px">
        <h1 style="margin:0;font-size:28px">${daysLeft === 1 ? '🚨' : '⏰'} Sadece ${daysLeft} gün kaldı!</h1>
      </div>
      <p style="font-size:16px">Merhaba,</p>
      <p style="font-size:15px;line-height:1.6">
        <strong>${menuTitle}</strong> için BazarX-GO menü hakkın <strong>${daysLeft} gün</strong> içinde sona eriyor.
        Kullanmak veya bir yakınına devretmek için acele et!
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="${process.env.FRONTEND_URL ?? 'http://localhost:3002'}/bazarx-go/wallet"
           style="background:#111;color:#fff;padding:14px 32px;border-radius:32px;text-decoration:none;font-weight:700;font-size:14px">
          QR Cüzdanıma Git →
        </a>
      </div>
      <p style="font-size:12px;color:#999;text-align:center">BazarX-GO · Yemeksiz yeme, öde</p>
    </div>`;
  }

  private buildTransferMail(fromName: string, menuTitle: string): string {
    return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;color:#111">
      <div style="background:#22c55e;color:#fff;padding:24px;border-radius:16px;text-align:center;margin-bottom:24px">
        <h1 style="margin:0;font-size:28px">🎁 Sana bir menü hediye edildi!</h1>
      </div>
      <p style="font-size:16px">Merhaba,</p>
      <p style="font-size:15px;line-height:1.6">
        <strong>${fromName}</strong> sana <strong>${menuTitle}</strong> menüsünü BazarX-GO üzerinden hediye etti.
        QR kodun cüzdanına düştü — restoranda göster, öde.
      </p>
      <div style="text-align:center;margin:32px 0">
        <a href="${process.env.FRONTEND_URL ?? 'http://localhost:3002'}/bazarx-go/wallet"
           style="background:#111;color:#fff;padding:14px 32px;border-radius:32px;text-decoration:none;font-weight:700;font-size:14px">
          Hediyemi Gör →
        </a>
      </div>
      <p style="font-size:12px;color:#999;text-align:center">BazarX-GO · Yemeksiz yeme, öde</p>
    </div>`;
  }

  private buildReservationMail(restaurantName: string, date: string, timeSlot: string, confirmed: boolean): string {
    const color = confirmed ? '#22c55e' : '#ef4444';
    const icon  = confirmed ? '✅' : '❌';
    const msg   = confirmed ? 'onaylandı' : 'iptal edildi';
    return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;color:#111">
      <div style="background:${color};color:#fff;padding:24px;border-radius:16px;text-align:center;margin-bottom:24px">
        <h1 style="margin:0;font-size:28px">${icon} Rezervasyonun ${msg}!</h1>
      </div>
      <p style="font-size:15px;line-height:1.6">
        <strong>${restaurantName}</strong><br>
        Tarih: <strong>${date}</strong><br>
        Saat: <strong>${timeSlot}</strong>
      </p>
      <p style="font-size:12px;color:#999;text-align:center">BazarX-GO · Yemeksiz yeme, öde</p>
    </div>`;
  }
}
