// packages/shared/shared-security/src/encryption/encryption.service.ts

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const secret = process.env.ENCRYPTION_KEY;
    EncryptionService.validateKey(secret);
    this.key = crypto.scryptSync(secret!, 'salt', 32);
  }

  // TokenService.validateSecret ile aynı fail-fast pattern
  private static validateKey(value?: string): void {
    if (!value) {
      throw new Error('ENCRYPTION_KEY tanımlı değil. Uygulama başlatılamaz.');
    }
    if (value === 'default-secret-key-must-be-32-chars-long-123') {
      throw new Error('ENCRYPTION_KEY varsayılan değer içeriyor. Güçlü, rastgele bir anahtar kullanın.');
    }
    if (value.length < 32) {
      throw new Error(`ENCRYPTION_KEY en az 32 karakter olmalıdır (mevcut: ${value.length}).`);
    }
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');

    const iv      = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
