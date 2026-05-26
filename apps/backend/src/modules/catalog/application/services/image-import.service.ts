// apps/backend/src/modules/catalog/application/services/image-import.service.ts
// Import sırasında harici görsel URL'lerini MinIO'ya güvenilir biçimde yükleyen servis.
// Her resim için ayrı try/catch — tek hata tüm import'u durdurmaz.

import { Injectable, Inject, Logger } from '@nestjs/common';
import { MediaService } from '../../../media/application/services/media.service';

// ─── Sabitler ────────────────────────────────────────────────────────────────

/** Kabul edilmeyen URL pattern'leri — bu listede eşleşen URL'ler sessizce atlanır */
const URL_BLACKLIST: Array<string | RegExp> = [
  'placeholder',
  'sticker',
  'stamp',
  'indexing',
];

/** dsmcdn.com boyut prefix'i — orijinal URL'e dönüştürmek için */
const DSMCDN_RESIZE_RE = /^(https?:\/\/[^/]*dsmcdn\.com)\/mnresize\/\d+\/\d+\/(.*)/i;

/** SVG bitiş pattern'i */
const SVG_RE = /\.svg(\?.*)?$/i;

/** Maksimum resim sayısı */
const MAX_IMAGES = 8;

/** HTTP fetch timeout (ms) */
const FETCH_TIMEOUT_MS = 10_000;

// ─── Çıktı tipi ──────────────────────────────────────────────────────────────

export interface UploadedImage {
  /** Orijinal kaynak URL */
  originalUrl: string;
  /** MinIO obje anahtarı (mediaId) */
  minioKey: string;
  /** true: ürünün ana görseli */
  isPrimary: boolean;
  /** Sıralama indeksi (0-tabanlı) */
  order: number;
}

// ─── Servis ──────────────────────────────────────────────────────────────────

@Injectable()
export class ImageImportService {
  private readonly logger = new Logger(ImageImportService.name);

  constructor(
    private readonly mediaService: MediaService,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  // METOD 1: filterValidImageUrls
  // Ham URL listesini temizler ve doğrular.
  // Blacklist kontrolü, SVG filtresi, dsmcdn boyut prefix dönüşümü,
  // deduplication ve MAX_IMAGES sınırı bu metotta uygulanır.
  // ──────────────────────────────────────────────────────────────────────────
  filterValidImageUrls(urls: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const raw of urls) {
      // 1. Boş değerleri atla
      if (!raw || typeof raw !== 'string' || !raw.trim()) continue;

      let url = raw.trim();

      // 2. Yalnızca http/https kabul et
      if (!/^https?:\/\//i.test(url)) continue;

      // 3. SVG uzantılıları atla
      if (SVG_RE.test(url)) continue;

      // 4. Blacklist pattern kontrolü
      const lower = url.toLowerCase();
      const blocked = URL_BLACKLIST.some((pattern) =>
        typeof pattern === 'string'
          ? lower.includes(pattern)
          : pattern.test(url),
      );
      if (blocked) continue;

      // 5. dsmcdn.com mnresize prefix'ini kaldır → orijinal URL'e dönüştür
      //    https://cdn.dsmcdn.com/mnresize/620/920/ty.../img.jpg
      //    → https://cdn.dsmcdn.com/ty.../img.jpg
      const dsm = DSMCDN_RESIZE_RE.exec(url);
      if (dsm) {
        url = `${dsm[1]}/${dsm[2]}`;
        this.logger.debug(`[filterValidImageUrls] dsmcdn resize dönüştürüldü: ${url}`);
      }

      // 6. Deduplicate (normalize edilmiş URL bazında)
      if (seen.has(url)) continue;
      seen.add(url);

      result.push(url);

      // 7. Maksimum resim sayısı kontrolü
      if (result.length >= MAX_IMAGES) break;
    }

    return result;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // METOD 2: downloadAndUpload
  // Filtrelenmiş URL listesini sırasıyla fetch eder ve MinIO'ya yükler.
  // Her URL için ayrı try/catch — bir resim başarısız olursa diğerleri devam eder.
  // Hiçbiri yüklenemezse boş array döner, hata fırlatmaz.
  // ──────────────────────────────────────────────────────────────────────────
  async downloadAndUpload(
    urls: string[],
    productSlug: string,
    vendorId: string,
  ): Promise<UploadedImage[]> {
    // Önce whitelist/blacklist filtresi uygula
    const validUrls = this.filterValidImageUrls(urls);

    if (!validUrls.length) {
      this.logger.warn(`[ImageImport] Geçerli URL bulunamadı: ${productSlug}`);
      return [];
    }

    const uploaded: UploadedImage[] = [];

    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];

      try {
        // ── Fetch — AbortController ile timeout ──────────────────────────────
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        let response: Response;
        try {
          response = await fetch(url, {
            signal: controller.signal,
            redirect: 'follow',
          });
        } finally {
          clearTimeout(timer);
        }

        if (!response.ok) {
          this.logger.warn(
            `[ImageImport] HTTP ${response.status} — ${url} (ürün: ${productSlug})`,
          );
          continue;
        }

        // ── Content-Type kontrolü — yalnızca image/* kabul et ────────────────
        const contentType = response.headers.get('content-type') ?? '';
        if (!contentType.startsWith('image/')) {
          this.logger.warn(
            `[ImageImport] Geçersiz Content-Type "${contentType}" — ${url} atlandı`,
          );
          continue;
        }

        // ── Buffer'a dönüştür ─────────────────────────────────────────────────
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (!buffer.length) {
          this.logger.warn(`[ImageImport] Boş yanıt gövdesi — ${url} atlandı`);
          continue;
        }

        // ── MediaService.processAndUpload ile MinIO'ya yükle ─────────────────
        // Sharp dönüşümü (webp) MediaService içinde gerçekleşir — burada tekrar yapılmaz.
        const ext = (contentType.split('/')[1] ?? 'jpg').split(';')[0].trim();
        const originalname = `import-${productSlug}-${i}.${ext}`;

        const mockFile = {
          buffer,
          mimetype: contentType.split(';')[0].trim(),
          originalname,
          size: buffer.length,
        };

        const result = await this.mediaService.processAndUpload(mockFile, {
          subPath: `products/${vendorId}`,
        });

        if (!result.success) {
          this.logger.warn(
            `[ImageImport] MediaService yükleme başarısız — ${url} (ürün: ${productSlug})`,
          );
          continue;
        }

        uploaded.push({
          originalUrl: url,
          minioKey: result.data!.mediaId,
          isPrimary: uploaded.length === 0, // ilk başarılı yükleme primary
          order: uploaded.length,
        });

        this.logger.debug(
          `[ImageImport] Yüklendi [${uploaded.length}/${validUrls.length}]: ${url} → ${result.data!.mediaId}`,
        );
      } catch (err: unknown) {
        const isAbort = err instanceof Error && err.name === 'AbortError';
        const msg = isAbort
          ? `Timeout (${FETCH_TIMEOUT_MS / 1000}s)`
          : err instanceof Error
            ? err.message
            : String(err);
        this.logger.warn(`[ImageImport] URL atlandı — ${url}: ${msg}`);
        // Hata fırlatmadan bir sonraki URL'e geç
      }
    }

    if (!uploaded.length) {
      this.logger.warn(
        `[ImageImport] Hiçbir resim yüklenemedi: ${productSlug}`,
      );
    } else {
      this.logger.log(
        `[ImageImport] ${uploaded.length}/${validUrls.length} resim yüklendi — ${productSlug}`,
      );
    }

    return uploaded;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // METOD 3: downloadPrimary
  // Tek URL için downloadAndUpload wrapper'ı.
  // null dönerse ürün yükleme resim olmadan devam eder — hata fırlatmaz.
  // ──────────────────────────────────────────────────────────────────────────
  async downloadPrimary(
    url: string,
    productSlug: string,
    vendorId: string,
  ): Promise<UploadedImage | null> {
    if (!url) return null;

    const results = await this.downloadAndUpload([url], productSlug, vendorId);
    return results[0] ?? null;
  }
}
