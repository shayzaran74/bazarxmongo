// apps/backend/src/modules/menu/infrastructure/fcm/go-fcm.service.ts
// Faz 5: GO'ya özgü FCM servisi — user.fcmToken üzerinden push
// IdentityPublicService yerine doğrudan @InjectModel kullanılıyor:
// fcmToken ve notificationPreferences alanları yalnızca bu servisin ihtiyacı olan
// GO modülüne özgü alanlardır; IdentityPublicService'e taşımak modül bağımlılığını artırır.
/* eslint-disable @barterborsa/no-cross-module-user-inject */

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '@barterborsa/shared-persistence';
import { FcmService } from '../../../communication/infrastructure/push/fcm.service';

@Injectable()
export class GoFcmService {
  private readonly logger = new Logger(GoFcmService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private readonly fcm: FcmService,
  ) {}

  async sendToUser(
    userId: string,
    notification: { title: string; body: string; data?: Record<string, string>; imageUrl?: string },
  ): Promise<void> {
    const user = await (this.userModel as Model<IUser & { fcmToken?: string }>)
      .findOne({ id: userId })
      .lean();

    if (!user?.fcmToken) {
      this.logger.debug(`FCM token yok: userId=${userId}`);
      return;
    }

    // Sessiz saat kontrolü
    if (this.isQuietHour(user.notificationPreferences)) {
      this.logger.debug(`Sessiz saat — push atlandı: ${userId}`);
      return;
    }

    await this.fcm.sendToTokens([user.fcmToken], notification);
    this.logger.debug(`Push gönderildi: userId=${userId}`);
  }

  private isQuietHour(prefs?: IUser['notificationPreferences']): boolean {
    if (!prefs) return false;
    const h = new Date().getHours();
    return h >= prefs.silentHoursStart || h < prefs.silentHoursEnd;
  }
}