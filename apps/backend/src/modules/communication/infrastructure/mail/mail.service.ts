// apps/backend/src/modules/communication/infrastructure/mail/mail.service.ts
// Resend API (tercih edilen) → SMTP fallback (nodemailer)
// RESEND_API_KEY env yoksa SMTP ile çalışır.

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger     = new Logger(MailService.name);
  private readonly resendKey?: string;
  private readonly from:       string;
  private transporter?: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.resendKey = config.get<string>('RESEND_API_KEY');
    this.from      = config.get<string>('SMTP_FROM') ?? '"BazarX" <noreply@bazarx.com>';

    if (!this.resendKey) {
      // SMTP fallback
      this.transporter = nodemailer.createTransport({
        host:   config.get('SMTP_HOST'),
        port:   parseInt(config.get('SMTP_PORT') ?? '587', 10),
        secure: false,
        auth: {
          user: config.get('SMTP_USER'),
          pass: config.get('SMTP_PASSWORD'),
        },
      });
      this.logger.warn('RESEND_API_KEY bulunamadı — SMTP fallback kullanılıyor');
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (this.resendKey) {
      await this.sendViaResend(to, subject, html);
    } else {
      await this.sendViaSMTP(to, subject, html);
    }
  }

  /** Resend API — yüksek deliverability, işlemsel mail */
  private async sendViaResend(to: string, subject: string, html: string): Promise<void> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.resendKey}`,
        },
        body: JSON.stringify({ from: this.from, to, subject, html }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Resend API hatası (${res.status}): ${body}`);
      }

      const data = await res.json() as { id: string };
      this.logger.log(`Mail gönderildi (Resend): ${data.id} → ${to}`);
    } catch (err: unknown) {
      this.logger.error('Resend mail gönderilemedi:', err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  /** SMTP fallback (nodemailer) */
  private async sendViaSMTP(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) throw new Error('SMTP yapılandırılmamış');
    const info = await this.transporter.sendMail({ from: this.from, to, subject, html });
    this.logger.log(`Mail gönderildi (SMTP): ${info.messageId} → ${to}`);
  }

  // ── Hazır şablonlar (mevcut) ──────────────────────────────────────────────

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;color:#111">
        <h2 style="margin:0 0 16px">BazarX'e Hoş Geldiniz!</h2>
        <p>Hesabınızı doğrulamak için:</p>
        <div style="background:#f4f4f4;padding:16px;font-size:28px;font-weight:700;letter-spacing:8px;text-align:center;border-radius:8px;margin:16px 0">
          ${code}
        </div>
        <p style="font-size:13px;color:#666">Bu kod 10 dakika geçerlidir.</p>
      </div>`;
    await this.sendMail(to, 'BazarX E-posta Doğrulama Kodu', html);
  }
}
