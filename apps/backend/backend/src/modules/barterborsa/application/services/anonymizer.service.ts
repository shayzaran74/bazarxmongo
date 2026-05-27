// apps/backend/src/modules/barterborsa/application/services/anonymizer.service.ts
// Master Plan v4.3 §4.4 + §5.3 — Kör Havuz (Blind Pool) anonimlik servisi
// Bayilerin ve fabrika ürünlerinin gerçek kimlikleri sipariş onaylanana kadar maskelenir.

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class AnonymizerService {
  private readonly logger = new Logger(AnonymizerService.name);
  // HMAC-SHA256 deterministik hash için kiracı (tenant) seviyesinde gizli anahtar.
  // .env'de ANONYMIZER_SECRET olarak set edilmelidir.
  private readonly secret: string;

  constructor(private readonly config: ConfigService) {
    const secret = this.config.get<string>('ANONYMIZER_SECRET');
    if (!secret) {
      this.logger.warn('ANONYMIZER_SECRET tanımlı değil — fallback değer kullanılıyor. Üretimde mutlaka set edilmelidir.');
    }
    this.secret = secret ?? 'bazarx-default-anonymizer-secret-do-not-use-in-prod';
  }

  /**
   * Bir vendorId / dealerId değerini deterministik anonymousId'ye dönüştürür.
   * Aynı giriş her zaman aynı çıktıyı verir (bayi takibi tutarlı kalsın diye),
   * fakat dış kullanıcı geri çözemez.
   */
  public anonymize(id: string, scope: 'vendor' | 'dealer' | 'pool' = 'vendor'): string {
    if (!id) return '';
    const hmac = createHmac('sha256', this.secret).update(`${scope}:${id}`).digest('hex');
    // İlk 12 karakter — okuma kolaylığı, çakışma olasılığı pratikte sıfır (2^48)
    return `anon_${scope}_${hmac.substring(0, 12)}`;
  }

  /**
   * Bir listing veya pool entry objesinin gerçek kimlik alanlarını
   * anonymousId ile maskeleyerek client'a gönderilmek üzere döner.
   */
  public maskListing<T extends { vendorId?: string; dealerId?: string }>(
    entity: T,
  ): T & { anonymousVendorId?: string; anonymousDealerId?: string } {
    const cloned: T & { anonymousVendorId?: string; anonymousDealerId?: string } = { ...entity };
    if (cloned.vendorId) {
      cloned.anonymousVendorId = this.anonymize(cloned.vendorId, 'vendor');
      delete cloned.vendorId;
    }
    if (cloned.dealerId) {
      cloned.anonymousDealerId = this.anonymize(cloned.dealerId, 'dealer');
      delete cloned.dealerId;
    }
    return cloned;
  }

  /**
   * Eşleşme/escrow tamamlandıktan sonra anonymousId → vendorId çözümleme için
   * yetkilendirilmiş aramayı yapan repository'ye yardımcı (anon → asıl id index).
   * Burada sadece anahtar üretilir; çözüm DB'de tutulan map'ten yapılır.
   */
  public deriveLookupKey(id: string, scope: 'vendor' | 'dealer' | 'pool' = 'vendor'): string {
    return this.anonymize(id, scope);
  }
}
