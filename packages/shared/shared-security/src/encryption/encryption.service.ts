// packages/shared/shared-security/src/encryption/encryption.service.ts

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    // ENCRYPTION_KEY .env dosyasından gelmeli (32 karakterlik bir string)
    const secret = process.env.ENCRYPTION_KEY || 'default-secret-key-must-be-32-chars-long-123';
    this.key = crypto.scryptSync(secret, 'salt', 32);
  }

  /**
   * Veriyi şifreler.
   * @param text Şifrelenecek metin
   * @returns Şifrelenmiş veri formatı: iv:authTag:encryptedData
   */
  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Şifrelenmiş veriyi çözer.
   * @param encryptedData format: iv:authTag:encryptedData
   * @returns Orijinal metin
   */
  decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
