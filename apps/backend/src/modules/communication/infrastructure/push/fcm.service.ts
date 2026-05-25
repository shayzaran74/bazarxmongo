// apps/backend/src/modules/communication/infrastructure/push/fcm.service.ts
// Firebase Cloud Messaging — HTTP v1 API
// GOOGLE_SERVICE_ACCOUNT_JSON env ile çalışır; yoksa sessizce mock moda geçer.
// Legacy fcm/send (deprecated Haziran 2024) → v1/projects/{id}/messages:send

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

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

interface ServiceAccountKey {
  project_id:   string;
  private_key:  string;
  client_email: string;
}

interface TokenCache {
  value:     string;
  expiresAt: number;
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private readonly serviceAccount: ServiceAccountKey | null;
  private tokenCache: TokenCache | null = null;

  constructor(private readonly config: ConfigService) {
    const saJson = config.get<string>('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (saJson) {
      try {
        this.serviceAccount = JSON.parse(saJson) as ServiceAccountKey;
        this.logger.log(`FCM HTTP v1 hazır — proje: ${this.serviceAccount.project_id}`);
      } catch {
        this.serviceAccount = null;
        this.logger.warn('GOOGLE_SERVICE_ACCOUNT_JSON geçersiz JSON — push bildirimleri log olarak gösterilecek');
      }
    } else {
      this.serviceAccount = null;
      this.logger.warn('GOOGLE_SERVICE_ACCOUNT_JSON ayarlanmamış — push bildirimleri log olarak gösterilecek');
    }
  }

  private base64url(data: string): string {
    return Buffer.from(data)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.value;
    }

    const sa = this.serviceAccount!;
    const now = Math.floor(Date.now() / 1000);
    const header  = this.base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payload = this.base64url(JSON.stringify({
      iss:   sa.client_email,
      sub:   sa.client_email,
      aud:   'https://oauth2.googleapis.com/token',
      iat:   now,
      exp:   now + 3600,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
    }));

    const signingInput = `${header}.${payload}`;
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signingInput);
    const signature = sign.sign(sa.private_key, 'base64')
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const jwt = `${signingInput}.${signature}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion:  jwt,
      }).toString(),
    });

    const json = await res.json() as { access_token: string; expires_in: number };
    this.tokenCache = {
      value:     json.access_token,
      expiresAt: Date.now() + (json.expires_in - 60) * 1000,
    };
    return this.tokenCache.value;
  }

  async sendToToken(token: string, payload: FcmPayload): Promise<FcmResult> {
    if (!this.serviceAccount) {
      this.logger.debug(`[FCM-MOCK] → ${token.slice(0, 20)}... | ${payload.title}: ${payload.body}`);
      return { token, success: true };
    }

    try {
      const accessToken = await this.getAccessToken();
      const projectId   = this.serviceAccount.project_id;

      const body = {
        message: {
          token,
          notification: { title: payload.title, body: payload.body, image: payload.imageUrl },
          data: payload.data ?? {},
        },
      };

      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        this.logger.warn(`FCM v1 gönderim başarısız: ${res.status} → ${errText}`);
        return { token, success: false, error: errText };
      }

      return { token, success: true };
    } catch (err: unknown) {
      this.logger.error('FCM v1 istek hatası', { error: String(err) });
      return { token, success: false, error: String(err) };
    }
  }

  async sendToTokens(tokens: string[], payload: FcmPayload): Promise<FcmResult[]> {
    if (tokens.length === 0) return [];

    const batches: string[][] = [];
    for (let i = 0; i < tokens.length; i += 500) {
      batches.push(tokens.slice(i, i + 500));
    }

    const results: FcmResult[] = [];
    for (const batch of batches) {
      const batchResults = await Promise.all(batch.map(t => this.sendToToken(t, payload)));
      results.push(...batchResults);
    }

    const successCount = results.filter(r => r.success).length;
    this.logger.log(`FCM toplu gönderim: ${successCount}/${results.length} başarılı`);
    return results;
  }
}
