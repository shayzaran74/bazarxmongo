// apps/backend/src/modules/catalog/application/services/trendyol-import-normalizer.service.ts
// Trendyol JSON ham nesnelerini NormalizedProductRow'a dönüştüren merkezi servis.
// Admin ve vendor import pathlerinde tekrar eden parse kodunu ortadan kaldırır.

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ImportCategoryResolverService } from './import-category-resolver.service';
import { ImageImportService } from './image-import.service';
import {
  TRENDYOL_FIELD_MAP,
  TrendyolFieldKey,
  NormalizedProductRow,
} from './trendyol-schema.const';

// ─── Sabitler ────────────────────────────────────────────────────────────────

/** Marka alanı bu uzunluğu geçerse ürün adının ilk kelimesi kullanılır */
const BRAND_MAX_LEN = 60;

/** Marka + isim benzerlik eşiği (Jaccard token benzerliği) */
const BRAND_SIMILARITY_THRESHOLD = 0.8;

/** Fiyat sıfır veya negatif olduğunda uygulanan minimum değer */
const MIN_PRICE = 0.01;

@Injectable()
export class TrendyolImportNormalizerService {
  private readonly logger = new Logger(TrendyolImportNormalizerService.name);

  constructor(
    private readonly categoryResolver: ImportCategoryResolverService,
    private readonly imageImport:      ImageImportService,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  // Ana normalize metodu — ham Trendyol JSON nesnesini NormalizedProductRow'a çevirir.
  // Whitelist dışındaki alanlar bu metotta zaten okunmaz (TRENDYOL_FIELD_MAP üzerinden erişim).
  // ──────────────────────────────────────────────────────────────────────────
  async normalize(raw: Record<string, unknown>): Promise<NormalizedProductRow> {
    // ── 1. Ham alan değerlerini whitelist üzerinden çek ───────────────────────
    const get = <T = string>(key: TrendyolFieldKey): T | undefined => {
      const variants = TRENDYOL_FIELD_MAP[key] as readonly string[];
      for (const variant of variants) {
        const val = raw[variant];
        if (val !== null && val !== undefined && val !== '') {
          return val as T;
        }
      }
      return undefined;
    };

    // ── 2. name — boşsa hata fırlat ───────────────────────────────────────────
    const rawName = String(get('name') ?? '').trim();
    if (!rawName) {
      throw new BadRequestException('Ürün adı boş olamaz');
    }
    const name = rawName;

    // ── 3. description ────────────────────────────────────────────────────────
    const rawDesc = String(get('description') ?? '').trim();
    const { cleanDescription, platformInfo, stock: parsedStockFromDesc } = this.parseDescription(rawDesc);
    const description = cleanDescription;

    // ── 4. price — 0 veya negatifse MIN_PRICE ────────────────────────────────
    const rawPrice = get<number | string>('price');
    const parsedPrice = parseFloat(String(rawPrice ?? 0).replace(',', '.'));
    const price = !isFinite(parsedPrice) || parsedPrice <= 0 ? MIN_PRICE : parsedPrice;

    // ── 5. stock — NaN veya negatifse 0 ──────────────────────────────────────
    const rawStock = get<number | string>('stock');
    let stock = 0;
    if (rawStock !== undefined && rawStock !== null && rawStock !== '') {
      const parsedStock = parseInt(String(rawStock), 10);
      stock = isNaN(parsedStock) || parsedStock < 0 ? 0 : parsedStock;
    } else {
      stock = parsedStockFromDesc;
    }

    // ── 6. kdv — varsayılan 20 ────────────────────────────────────────────────
    const rawKdv = get<number | string>('kdv');
    const kdv = parseInt(String(rawKdv ?? 20), 10) || 20;

    // ── 7. brand temizleme ────────────────────────────────────────────────────
    const rawBrand = String(get('brand') ?? '').trim();
    const brand = this.cleanBrand(rawBrand, name);

    // ── 8. barcode / sku — ikisi de boşsa UUID barcode üret ──────────────────
    let barcode = String(get('barcode') ?? '').trim();
    const sku   = String(get('sku')     ?? '').trim();

    if (!barcode && !sku) {
      barcode = `TY-AUTO-${randomUUID()}`;
      this.logger.warn(
        `[TrendyolNormalizer] Barkod ve SKU boş — otomatik üretildi: "${barcode}" (ürün: "${name}")`,
      );
    }

    // ── 9. externalId ─────────────────────────────────────────────────────────
    const rawExternalId = get('externalId');
    const externalId = rawExternalId ? String(rawExternalId).trim() : null;

    // ── 10. categoryId — ImportCategoryResolverService ile çözümle ────────────
    const categoryHint = String(get('categoryHint') ?? '').trim() || undefined;
    // Trendyol subcategory formatı: "Elektronik > Telefon > Akıllı Telefon"
    // En spesifik (son) segmenti kullan; bulunamazsa resolver varsayılana düşer
    const lastSegment = categoryHint
      ? categoryHint.split('>').map(s => s.trim()).filter(Boolean).pop()
      : undefined;
    const categoryId = await this.categoryResolver.resolveCategoryId(lastSegment);

    // ── 11. görsel URL'leri — ImageImportService ile filtrele ─────────────────
    const primaryRaw = String(get('primaryImage') ?? '').trim() || null;

    // image_urls: dizi veya pipe/virgül ayrımlı string olabilir
    const imageUrlsRaw = get<unknown>('imageUrls');
    let rawImageList: string[] = [];
    if (Array.isArray(imageUrlsRaw)) {
      rawImageList = imageUrlsRaw.map(u => String(u)).filter(Boolean);
    } else if (typeof imageUrlsRaw === 'string' && imageUrlsRaw) {
      rawImageList = imageUrlsRaw.split(/[|,]/).map(u => u.trim()).filter(Boolean);
    }

    // primaryImage listeye dahil et (varsa başa ekle)
    const allUrls = primaryRaw
      ? [primaryRaw, ...rawImageList]
      : rawImageList;

    const imageUrls     = this.imageImport.filterValidImageUrls(allUrls);
    const primaryImageUrl = imageUrls[0] ?? null;

    // ── 12. attributes — yalnızca string: string çiftleri ────────────────────
    const rawAttrs = get<Record<string, unknown>>('attributes');
    const attributes: Record<string, string> = {};
    if (rawAttrs && typeof rawAttrs === 'object' && !Array.isArray(rawAttrs)) {
      for (const [k, v] of Object.entries(rawAttrs)) {
        if (typeof k === 'string' && v !== null && v !== undefined) {
          attributes[k] = String(v);
        }
      }
    }
    if (platformInfo) {
      attributes['_platformInfo'] = platformInfo;
    }

    return {
      barcode,
      sku,
      name,
      description,
      price,
      stock,
      kdv,
      brand,
      categoryId,
      primaryImageUrl,
      imageUrls,
      externalId,
      attributes,
      source: 'trendyol',
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Yardımcı: Marka temizleme
  // Kural 1: 60+ karakter → name'in ilk kelimesi
  // Kural 2: %80+ token benzerliği ile name → name'in ilk kelimesi
  // Sonuç max 100 karakter
  // ──────────────────────────────────────────────────────────────────────────
  private cleanBrand(rawBrand: string, name: string): string {
    const fallback = name.split(/\s+/)[0]?.slice(0, 100) ?? 'Genel';

    if (!rawBrand) return fallback;

    // Kural 1: çok uzun
    if (rawBrand.length > BRAND_MAX_LEN) {
      this.logger.debug(
        `[TrendyolNormalizer] Marka çok uzun (${rawBrand.length} char) → fallback: "${fallback}"`,
      );
      return fallback;
    }

    // Kural 2: isimle token benzerliği (Jaccard)
    if (this.jaccardSimilarity(rawBrand, name) >= BRAND_SIMILARITY_THRESHOLD) {
      this.logger.debug(
        `[TrendyolNormalizer] Marka isimle çok benzer → fallback: "${fallback}"`,
      );
      return fallback;
    }

    return rawBrand.slice(0, 100);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Jaccard token benzerliği: |A ∩ B| / |A ∪ B|
  // Büyük/küçük harf duyarsız, kelime bazında karşılaştırma
  // ──────────────────────────────────────────────────────────────────────────
  private jaccardSimilarity(a: string, b: string): number {
    const tokenize = (s: string): Set<string> =>
      new Set(s.toLowerCase().split(/\s+/).filter(Boolean));

    const setA = tokenize(a);
    const setB = tokenize(b);

    if (!setA.size && !setB.size) return 1;
    if (!setA.size || !setB.size) return 0;

    let intersection = 0;
    for (const token of setA) {
      if (setB.has(token)) intersection++;
    }

    const union = setA.size + setB.size - intersection;
    return intersection / union;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Açıklama temizleme ve platform bilgisi ayıklama
  // ──────────────────────────────────────────────────────────────────────────
  private parseDescription(raw: string): { cleanDescription: string; platformInfo: string; stock: number } {
    if (!raw?.trim()) return { cleanDescription: '', platformInfo: '', stock: 1 };

    let stock = 1;
    const moreMatch = raw.match(/(\d+)\s*adetten fazla stok/i);
    if (moreMatch) stock = Math.max(parseInt(moreMatch[1], 10), 1);
    const lessMatch = raw.match(/(\d+)\s*adetten az stok/i);
    if (lessMatch && !moreMatch) stock = Math.max(parseInt(lessMatch[1], 10), 1);

    const specsIdx = raw.indexOf('Ürün Özellikleri:');
    const relevantPart = specsIdx >= 0 ? raw.slice(0, specsIdx) : raw;

    const BOILERPLATE = [
      /^Bu ürün\b/i,
      /tarafından gönderilecektir/i,
      /^Kampanya fiyatından/i,
      /^Ürüne ait garanti belgesi/i,
      /^Ürün teslimi sonrası/i,
      /^Bir ürün, birden fazla satıcı/i,
      /^Bu üründen en fazla/i,
      /^Belirlenen bu limiti/i,
      /adetten fazla stok/i,
      /adetten az stok/i,
      /link ve karekod/i,
      /sıralanmaktadır\.?\s*$/i,
    ];

    const platformLines: string[] = [];
    const cleanLines: string[] = [];

    for (const line of relevantPart.split(/\n/).map(l => l.trim()).filter(Boolean)) {
      if (BOILERPLATE.some(p => p.test(line))) {
        platformLines.push(line);
      } else {
        cleanLines.push(line);
      }
    }

    return {
      cleanDescription: cleanLines.join('\n').trim(),
      platformInfo: platformLines.join('\n').trim(),
      stock,
    };
  }
}
