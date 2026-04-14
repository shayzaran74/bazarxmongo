# BazarX Yazılım Geliştirme Kuralları (Mutlak Kurallar)

Bu dosya projenin teknik standartlarını belirler. Her geliştirme bu kurallara uymak zorundadır.

## 1. Tip Güvenliği
- **any** tipi KESİNLİKLE YASAKTIR. (Sıfır tolerans)
- Tüm değişkenler, fonksiyon parametreleri ve dönüş tipleri açıkça tanımlanacaktır.
- Karmaşık tipler için `interface` veya `type` kullanılacaktır.

## 2. TypeScript Direktifleri
- `@ts-ignore` veya `@ts-expect-error` kullanımı YASAKTIR.
- Eğer bir tip hatası varsa, ignor etmek yerine tip tanımı düzeltilecektir.

## 3. Loglama Standartları
- `console.log` kullanımı YASAKTIR.
- Sadece `console.error` ve `console.warn` (gerçek hata durumlarında) kullanılabilir.
- Uygulama içi loglama için `@barterborsa/shared-observability` altındaki `StructuredLogger` kullanılacaktır.

## 4. Frontend (Nuxt 3) Standartları
- **script setup lang="ts"** kullanımı zorunludur. (Options API yasaktır).
- **Hardcoded URL YASAKTIR.** Tüm API çağrıları `useRuntimeConfig().public.apiBase` üzerinden yapılacaktır.
- Tüm composable ve store'lar **SSR-safe** olmalıdır.
- Browser API (window, document, localStorage vb.) erişimleri sadece `onMounted` içinde veya `if (import.meta.client)` kontrolü altında yapılabilir.
- Import path'leri `~/` prefix'i ile kullanılacaktır (Ör: `~/stores/auth`).

## 5. Dokümantasyon ve Dil
- Kod içi yorum satırları **Türkçe** olacaktır.
- Kompleks kısımlar için kısa ve net açıklamalar eklenecektir.