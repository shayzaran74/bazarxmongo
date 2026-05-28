// apps/backend/src/modules/menu/application/jobs/go-notification.processor.ts
// Faz 5: GO bildirimleri — BullMQ NOTIFICATION_QUEUE işlemcisi

import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenuPurchase } from '@barterborsa/shared-persistence';
import { GoFcmService } from '../../infrastructure/fcm/go-fcm.service';
import { MailService } from '../../../communication/infrastructure/mail/mail.service';

export type GoNotificationJobData =
  | { name: 'MEMBERSHIP_DAY_2'; userId: string }
  | { name: 'MEMBERSHIP_DAY_5'; userId: string }
  | { name: 'MEMBERSHIP_DAY_10'; userId: string }
  | { name: 'MEMBERSHIP_DAY_13'; userId: string }
  | { name: 'MEMBERSHIP_DAY_15'; userId: string }
  | { name: 'MEMBERSHIP_ACTIVATED'; userId: string }
  | { name: 'QR_EXPIRY_3DAYS'; userId: string; purchaseId: string }
  | { name: 'QR_EXPIRY_1DAY'; userId: string; purchaseId: string }
  | { name: 'QR_EXPIRY_LAST_DAY'; userId: string; purchaseId: string }
  | { name: 'MENU_TRANSFER_RECEIVED'; userId: string; fromName: string; menuTitle: string }
  | { name: 'REFERRAL_BONUS_EARNED'; userId: string; bonusCategory: number }
  | { name: 'RESTAURANT_INSTANT_QR'; userId: string; restaurantName: string };

@Processor('NOTIFICATION_QUEUE')
export class GoNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(GoNotificationProcessor.name);

  constructor(
    @InjectModel('MenuPurchase') private readonly purchaseModel: Model<IMenuPurchase>,
    private readonly fcm: GoFcmService,
    private readonly mail: MailService,
  ) { super(); }

  async process(job: Job<GoNotificationJobData>): Promise<void> {
    const { name } = job.data as GoNotificationJobData & { name: string };
    const data = job.data as Exclude<GoNotificationJobData, { name: string }>;

    switch (name) {
      case 'MEMBERSHIP_DAY_2':
        await this.notifyDay2((data as { userId: string }).userId);
        break;
      case 'MEMBERSHIP_DAY_5':
        await this.notifyDay5((data as { userId: string }).userId);
        break;
      case 'MEMBERSHIP_DAY_10':
        await this.notifyDay10((data as { userId: string }).userId);
        break;
      case 'MEMBERSHIP_DAY_13':
        await this.notifyDay13((data as { userId: string }).userId);
        break;
      case 'MEMBERSHIP_DAY_15':
        await this.notifyDay15((data as { userId: string }).userId);
        break;
      case 'MEMBERSHIP_ACTIVATED':
        await this.notifyActivated((data as { userId: string }).userId);
        break;
      case 'QR_EXPIRY_3DAYS': {
        const { userId, purchaseId } = data as { userId: string; purchaseId: string };
        await this.notifyQrExpiry(userId, purchaseId, 3);
        break;
      }
      case 'QR_EXPIRY_1DAY': {
        const { userId, purchaseId } = data as { userId: string; purchaseId: string };
        await this.notifyQrExpiry(userId, purchaseId, 1);
        break;
      }
      case 'QR_EXPIRY_LAST_DAY': {
        const { userId, purchaseId } = data as { userId: string; purchaseId: string };
        await this.notifyQrExpiry(userId, purchaseId, 0);
        break;
      }
      case 'MENU_TRANSFER_RECEIVED': {
        const d = data as { userId: string; fromName: string; menuTitle: string };
        await this.notifyTransferReceived(d.userId, d.fromName, d.menuTitle);
        break;
      }
      case 'REFERRAL_BONUS_EARNED': {
        const d = data as { userId: string; bonusCategory: number };
        await this.notifyReferralBonus(d.userId, d.bonusCategory);
        break;
      }
      case 'RESTAURANT_INSTANT_QR': {
        const d = data as { userId: string; restaurantName: string };
        await this.notifyInstantQr(d.userId, d.restaurantName);
        break;
      }
      default:
        this.logger.warn(`Bilinmeyen GO notification job: ${name}`);
    }
  }

  private async notifyDay2(userId: string) {
    await this.fcm.sendToUser(userId, {
      title: 'Yakın Restoranları Keşfet! 🍽️',
      body: 'BazarX-GO ile çevrendeki lezzetleri keşfet. 14 gün sonra QR menülerin aktifleşiyor!',
      data: { screen: 'home' },
    });
  }

  private async notifyDay5(userId: string) {
    await this.fcm.sendToUser(userId, {
      title: '11 gün kaldı! ⏳',
      body: 'QR menülerin yakında aktifleşecek. Hediye kartını kullanmaya başla!',
      data: { screen: 'wallet' },
    });
  }

  private async notifyDay10(userId: string) {
    await this.fcm.sendToUser(userId, {
      title: '6 gün kaldı! 🎉',
      body: 'Bir hafta sonra QR menülerin aktifleşiyor. Hangi restoranı deneyeceksin?',
      data: { screen: 'wallet' },
    });
  }

  private async notifyDay13(userId: string) {
    await this.fcm.sendToUser(userId, {
      title: '3 gün kaldı — QR\'ların ne bilir misin? 📱',
      body: 'QR menülerini nasıl kullanacağını öğren. Restoranda göster, öde!',
      data: { screen: 'education' },
    });
  }

  private async notifyDay15(userId: string) {
    await this.fcm.sendToUser(userId, {
      title: 'Yarın aktif! 🎊',
      body: 'Yarın QR menülerin açılıyor. Hazır mısın?',
      data: { screen: 'wallet' },
    });
  }

  private async notifyActivated(userId: string) {
    await this.fcm.sendToUser(userId, {
      title: 'QR menülerin hazır! 🚀',
      body: 'Artık restorana gidebilirsin. QR cüzdanına git ve menülerini gör!',
      data: { screen: 'wallet' },
    });
  }

  private async notifyQrExpiry(userId: string, purchaseId: string, daysLeft: number) {
    const purchase = await this.purchaseModel.findOne({ id: purchaseId }).lean();
    const menuTitle = purchase?.menuCategory
      ? `Kategori ${purchase.menuCategory} menü`
      : 'Menü hakkın';
    const emoji = daysLeft === 0 ? '🚨' : daysLeft === 1 ? '⚠️' : '⏰';
    await this.fcm.sendToUser(userId, {
      title: `${emoji} Menü hakkın ${daysLeft === 0 ? 'bugün bitiyor!' : `${daysLeft} gün içinde sona eriyor!`}`,
      body: `${menuTitle} için QR\'ını kullanmayı unutma.`,
      data: { screen: 'wallet', daysLeft: String(daysLeft) },
    });
  }

  private async notifyTransferReceived(userId: string, fromName: string, menuTitle: string) {
    await this.fcm.sendToUser(userId, {
      title: '🎁 Menü hediye edildi!',
      body: `${fromName} sana "${menuTitle}" menüsünü gönderdi. QR cüzdanına düştü.`,
      data: { screen: 'wallet' },
    });
  }

  private async notifyReferralBonus(userId: string, bonusCategory: number) {
    await this.fcm.sendToUser(userId, {
      title: '🎉 Referans bonusun geldi!',
      body: `3. referansın tamamlandı! Kategori ${bonusCategory} bonus menü hakkın cüzdanında.`,
      data: { screen: 'wallet' },
    });
  }

  private async notifyInstantQr(userId: string, restaurantName: string) {
    await this.fcm.sendToUser(userId, {
      title: '⚡ Yakınında anlık fırsat!',
      body: `${restaurantName} boş saat açtı. Hemen kontrol et!`,
      data: { screen: 'home' },
    });
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    this.logger.error(`GO notification job failed: ${job.id} — ${job.name}`);
  }
}