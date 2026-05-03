import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM') || '"BazarX" <noreply@bazarx.local>',
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Email send failed:', error);
      throw error;
    }
  }

  async sendVerificationCode(to: string, code: string) {
    const subject = 'BazarX E-posta Doğrulama Kodu';
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>BazarX'e Hoş Geldiniz!</h2>
        <p>Hesabınızı doğrulamak için aşağıdaki 6 haneli kodu kullanın:</p>
        <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; border-radius: 8px;">
          ${code}
        </div>
        <p>Bu kod 10 dakika süreyle geçerlidir.</p>
        <p>Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}
