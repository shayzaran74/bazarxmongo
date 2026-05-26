// apps/backend/src/modules/catalog/application/services/trendyol-schema.const.ts
// TEK KAYNAK: Trendyol JSON whitelist şeması.
// Bu şema dışındaki tüm alanlar normalizer tarafından görmezden gelinir.

/**
 * Her key için okunabilecek alan adlarının öncelik sıralı listesi.
 * resolveField(): listeyi soldan sağa tarar, ilk null-olmayan değeri döner.
 */
export const TRENDYOL_FIELD_MAP = {
  barcode:      ['Barcode', 'barcode', 'barkod'],
  sku:          ['Model Kodu', 'sku', 'model_kodu'],
  name:         ['name', 'title'],
  description:  ['description'],
  price:        ['price'],
  stock:        ['stock', 'Stok'],
  kdv:          ['kdv'],
  brand:        ['brand'],
  categoryHint: ['subcategory', 'category'],
  primaryImage: ['image_url'],
  imageUrls:    ['image_urls'],
  externalId:   ['external_id'],
  attributes:   ['attributes'],
} as const;

export type TrendyolFieldKey = keyof typeof TRENDYOL_FIELD_MAP;

/** normalize() metodu çıktısı — bu arayüz dışında başka alan handler'a ulaşamaz */
export interface NormalizedProductRow {
  barcode:         string;
  sku:             string;
  name:            string;
  description:     string;
  price:           number;
  stock:           number;
  kdv:             number;
  brand:           string;
  /** ImportCategoryResolverService tarafından çözümlenmiş kategori ID */
  categoryId:      string;
  /** Birincil görsel URL (ham, yüklenmemiş) — null olabilir */
  primaryImageUrl: string | null;
  /** ImageImportService.filterValidImageUrls() ile temizlenmiş URL listesi */
  imageUrls:       string[];
  externalId:      string | null;
  attributes:      Record<string, string>;
  /** İzlenebilirlik için sabit kaynak etiketi */
  source:          'trendyol';
}
