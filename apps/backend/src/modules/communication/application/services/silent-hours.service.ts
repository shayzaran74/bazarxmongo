// apps/backend/src/modules/communication/application/services/silent-hours.service.ts
// FCM ve e-posta gönderimlerinde sessiz saat kontrolü (22:00–08:00 TST)

import { Injectable } from '@nestjs/common';

const DEFAULT_SILENT_START = 22;
const DEFAULT_SILENT_END   = 8;

@Injectable()
export class SilentHoursService {
  /**
   * Verilen zamanın kullanıcı timezone'unda sessiz saate denk gelip gelmediğini döner.
   * Varsayılan aralık 22:00–08:00 (Türkiye UTC+3).
   * `start > end` durumu (örn. 22–08) gece yarısını geçen aralıkları doğru hesaplar.
   */
  isSilentHour(
    now: Date = new Date(),
    userTimezone: string = 'Europe/Istanbul',
    silentHoursStart: number = DEFAULT_SILENT_START,
    silentHoursEnd: number = DEFAULT_SILENT_END,
  ): boolean {
    const formatter = new Intl.DateTimeFormat('tr-TR', {
      timeZone: userTimezone,
      hour: 'numeric',
      hour12: false,
    });
    const hour = parseInt(formatter.format(now), 10);
    const start = silentHoursStart;
    const end   = silentHoursEnd;
    return start > end
      ? hour >= start || hour < end
      : hour >= start && hour < end;
  }
}
