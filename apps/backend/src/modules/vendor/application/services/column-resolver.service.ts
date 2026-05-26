// apps/backend/src/modules/vendor/application/services/column-resolver.service.ts
// Whitelist tabanlı kolon çözümleyici — injection ve veri sızıntısı riskini sıfırlar.
// Ham Excel/CSV satırlarından YALNIZCA VENDOR_COLUMN_MAP'te tanımlı alanları okur.

import { Injectable, Logger } from '@nestjs/common';
import {
  VENDOR_COLUMN_MAP,
  VendorColumnKey,
  HeaderMap,
} from '../commands/column-map.const';

/** Handler'a ulaşan tek tip — ham row'dan türetilir, ek alan içeremez */
export interface ParsedVendorRow {
  name:         string;
  barcode:      string | undefined;
  sku:          string | undefined;
  price:        number;
  stock:        number;
  description:  string;
  brand:        string;
  categoryId:   string | undefined;
  primaryImage: string | undefined;
  extraImages:  string[];
  kdv:          number;
  status:       'ACTIVE' | 'INACTIVE' | 'PENDING';
}

/** Geçerli status değerleri */
const VALID_STATUS = new Set<string>(['ACTIVE', 'INACTIVE', 'PENDING']);

@Injectable()
export class ColumnResolverService {
  private readonly logger = new Logger(ColumnResolverService.name);

  // ────────────────────────────────────────────────────────────────────────────
  // Yardımcı: Normalizasyon zinciri
  //  1. Küçük harf
  //  2. Underscore (_) ve tire (-) → boşluk  [edge-case: 'urun_adi' → 'urun adi']
  //  3. Türkçe özel karakterler → ASCII karşılığı
  //  4. Çoklu boşlukları tek boşluğa indir
  //  5. Trim
  // ────────────────────────────────────────────────────────────────────────────
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/\*/g, '')        // zorunlu alan yıldızlarını temizle
      .replace(/[_\-]/g, ' ')    // underscore / tire → boşluk
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/ş/g, 's')
      .replace(/Ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/Ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/Ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/Ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'c')
      .replace(/\s+/g, ' ')      // çoklu boşluk → tek boşluk
      .trim();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 1. resolveHeaders
  // Dosyanın ham başlık satırını alır, her whitelist key için eşleşen kolonu döner.
  // Eşleşme yoksa null — hata fırlatmaz, çağıran sessizce atlar.
  // Bir kez çağrılır (dosya başında); her satır için extractRow kullanılır.
  // ────────────────────────────────────────────────────────────────────────────
  resolveHeaders(rawHeaders: string[]): HeaderMap {
    // Ham başlıkları normalize edilmiş → orijinal adı eşleşmesi için Map
    const normalizedToRaw = new Map<string, string>();
    for (const h of rawHeaders) {
      normalizedToRaw.set(this.normalize(h), h);
    }

    const result = {} as HeaderMap;

    for (const key of Object.keys(VENDOR_COLUMN_MAP) as VendorColumnKey[]) {
      const variants: readonly string[] = VENDOR_COLUMN_MAP[key];
      let matched: string | null = null;

      for (const variant of variants) {
        const normalizedVariant = this.normalize(variant);
        if (normalizedToRaw.has(normalizedVariant)) {
          matched = normalizedToRaw.get(normalizedVariant)!;
          break; // İlk eşleşme yeterli — öncelik sırası korunur
        }
      }

      result[key] = matched;
    }

    // Eşleşen / eşleşmeyen alanları logla (debug seviyesinde)
    const matched   = Object.entries(result).filter(([, v]) => v !== null).map(([k]) => k);
    const unmatched = Object.entries(result).filter(([, v]) => v === null).map(([k]) => k);
    this.logger.debug(`[resolveHeaders] Eşleşen: [${matched.join(', ')}]`);
    if (unmatched.length) {
      this.logger.debug(`[resolveHeaders] Eşleşmeyen (atlandı): [${unmatched.join(', ')}]`);
    }

    return result;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 2. extractRow
  // Ham satırdan YALNIZCA headerMap'teki null-olmayan key'leri okur.
  // Beyaz liste dışındaki tüm alanlar bu noktada sisteme girmez.
  // ────────────────────────────────────────────────────────────────────────────
  extractRow(
    rawRow: Record<string, unknown>,
    headerMap: HeaderMap,
  ): ParsedVendorRow {
    // Ham değeri güvenli şekilde string'e çevir
    const str = (key: VendorColumnKey): string | undefined => {
      const col = headerMap[key];
      if (!col) return undefined;
      const val = rawRow[col];
      if (val === null || val === undefined || val === '') return undefined;
      return String(val).trim() || undefined;
    };

    // name
    const name = str('name') ?? '';

    // barcode / sku
    const barcode = str('barcode');
    const sku     = str('sku');

    // price: virgül → nokta, parseFloat
    const rawPrice = str('price');
    const price    = rawPrice
      ? Math.max(0, parseFloat(rawPrice.replace(',', '.'))) || 0
      : 0;

    // stock: parseInt, NaN → 0
    const rawStock = str('stock');
    const stock    = rawStock ? Math.max(0, parseInt(rawStock, 10) || 0) : 0;

    // description / brand
    const description = str('description') ?? '';
    const brand       = str('brand') ?? 'Genel';

    // categoryId
    const categoryId = str('categoryId');

    // primaryImage
    const primaryImage = str('primaryImage');

    // extraImages: pipe veya virgül ile ayrılmış URL listesi
    const rawExtra = str('extraImages');
    const extraImages: string[] = rawExtra
      ? rawExtra
          .split(/[|,]/)
          .map((u) => u.trim())
          .filter(Boolean)
      : [];

    // kdv: parseInt, varsayılan 20
    const rawKdv = str('kdv');
    const kdv    = rawKdv ? parseInt(rawKdv, 10) || 20 : 20;

    // status: whitelist kontrolü — geçersiz değer → 'ACTIVE'
    const rawStatus = str('status')?.toUpperCase();
    const status: ParsedVendorRow['status'] = VALID_STATUS.has(rawStatus ?? '')
      ? (rawStatus as ParsedVendorRow['status'])
      : 'ACTIVE';

    return {
      name,
      barcode,
      sku,
      price,
      stock,
      description,
      brand,
      categoryId,
      primaryImage,
      extraImages,
      kdv,
      status,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 3. validateRow
  // İş kuralı doğrulaması — extractRow çıktısı üzerinde çalışır.
  // ────────────────────────────────────────────────────────────────────────────
  validateRow(row: ParsedVendorRow): { valid: boolean; reason?: string } {
    if (!row.name || row.name.trim() === '') {
      return { valid: false, reason: 'Ürün adı zorunludur' };
    }
    if (row.price < 0) {
      return { valid: false, reason: 'Fiyat negatif olamaz' };
    }
    if (row.stock < 0) {
      return { valid: false, reason: 'Stok negatif olamaz' };
    }
    if (!row.barcode && !row.sku) {
      return { valid: false, reason: 'Barkod veya SKU zorunludur' };
    }
    return { valid: true };
  }
}
