// apps/backend/src/modules/communication/infrastructure/push/fcm.service.ts
// Firebase Cloud Messaging — HTTP v1 API (firebase-admin paketi gerekmez)
// FCM_SERVER_KEY env değişkeni ile çalışır; yoksa sessizce atlanır.

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FcmPayload {
  title:  string;
  body:   string;
  data?:  Record<string, string>;
  imageUrl?: string;
}

export interface FcmResult {
  token:   string;
  success: boolean;
  error?:  string;
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private readonly serverKey: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.serverKey = config.get<string>('FCM_SERVER_KEY');
    if (!this.serverKey) {
      this.logger.warn('FCM_SERVER_KEY ayarlanmamış — push bildirimleri log olarak gösterilecek');
    }
  }

  /**
   * Tek bir FCM token'ına bildirim gönder.
   */
  async sendToToken(token: string, payload: FcmPayload): Promise<FcmResult> {
    if (!this.serverKey) {
      this.logger.debug(`[FCM-MOCK] → ${token.slice(0, 20)}... | ${payload.title}: ${payload.body}`);
      return { token, success: true };
    }

    try {
      const body = {
        to: token,
        notification: { title: payload.title, body: payload.body, image: payload.imageUrl },
        data: payload.data ?? {},
      };

      const res = await fetch('https://fcm.googleapis.com/fcm/send', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `key=${this.serverKey}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json() as { success: number; failure: number; results: { error?: string }[] };

      if (json.failure > 0) {
        const err = json.results?.[0]?.error ?? 'FCM hatası';
        this.logger.warn(`FCM gönderim başarısız: ${err} → ${token.slice(0, 20)}...`);
        return { token, success: false, error: err };
      }

      return { token, success: true };
    } catch (err: unknown) {
      this.logger.error('FCM istek hatası:', err);
      return { token, success: false, error: String(err) };
    }
  }

  /**
   * Birden fazla token'a toplu bildirim (max 500 per batch).
   */
  async sendToTokens(tokens: string[], payload: FcmPayload): Promise<FcmResult[]> {
    if (tokens.length === 0) return [];

    // FCM batch (max 500)
    const batches: string[][] = [];
    for (let i = 0; i < tokens.length; i += 500) {
      batches.push(tokens.slice(i, i + 500));
    }

    const results: FcmResult[] = [];
    for (const batch of batches) {
      const batchResults = await Promise.all(batch.map(t => this.sendToToken(t, payload)));
      results.push(...batchResults);
    }

    const success = results.filter(r => r.success).length;
    this.logger.log(`FCM toplu gönderim: ${success}/${results.length} başarılı`);
    return results;
  }
}
