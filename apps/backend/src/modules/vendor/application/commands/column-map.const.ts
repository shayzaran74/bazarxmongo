// apps/backend/src/modules/vendor/application/commands/column-map.const.ts
// TEK KAYNAK: Whitelist kolon haritası — bu dosyadan başka hiçbir yerde tanımlanmaz.
// Güvenlik kuralı: Sistem YALNIZCA bu listede tanımlı kolonları okur.
// Beyaz liste dışındaki tüm kolonlar sessizce görmezden gelinir.

/**
 * Her anahtar (VendorColumnKey), birden fazla Excel/CSV başlık varyantıyla eşleşebilir.
 * Normalizasyon: küçük harf + Türkçe karakter → ASCII → trim.
 * İlk eşleşen varyant kullanılır; öncelik sırası önemlidir.
 */
export const VENDOR_COLUMN_MAP = {
  name:         ['ürün adı', 'urun adi', 'başlık', 'baslik', 'name', 'product_name', 'title'],
  barcode:      ['barkod', 'barcode', 'gtin', 'ean'],
  sku:          ['sku', 'stok kodu', 'model kodu', 'model_kodu'],
  price:        ['fiyat', 'price', 'fiyat (tl)', 'fiyat(tl)'],
  stock:        ['stok', 'stock', 'envanter miktar', 'envanter_miktar', 'adet', 'miktar'],
  description:  ['açıklama', 'aciklama', 'description', 'ürün açıklaması'],
  brand:        ['marka', 'brand', 'marka adı'],
  categoryId:   ['kategori id', 'category_id', 'categoryid', 'kategori_id'],
  primaryImage: ['ana resim', 'ana_resim', 'image_url', 'resim', 'görsel'],
  extraImages:  ['ek resimler', 'ek_resimler', 'image_urls', 'resimler', 'görseller'],
  kdv:          ['kdv', 'kdv oranı', 'kdv_orani', 'vat', 'tax_rate'],
  status:       ['durum', 'status'],
} as const;

/** Whitelist'teki tüm anahtar isimleri */
export type VendorColumnKey = keyof typeof VENDOR_COLUMN_MAP;

/** resolveHeaders sonucu — her key için eşleşen ham başlık adı veya null */
export type HeaderMap = Record<VendorColumnKey, string | null>;
