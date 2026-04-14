# BarterBorsa Frontend — Bölüm 10: Content Sayfaları + Son Dokunuşlar

## SİSTEM TALİMATLARI

Bölüm 1-9 tamamlandı. Bu **son bölümde** yardım merkezi, politika sayfaları, duyurular, satıcı olma ve genel iyileştirmeler (performans, erişilebilirlik, hata yönetimi, son kontroller) yapılacak.

### MUTLAK KURALLAR
- `any` tipi **YASAK** — 0 tolerans
- `@ts-ignore` / `@ts-expect-error` **YASAK**
- `console.log` **YASAK**
- `<script setup lang="ts">` zorunlu
- SSR-safe
- Bölüm 1-9'daki composable/component'leri kullan
- `brand-*` ve `surface-*` Tailwind renk paleti

### BACKEND API ENDPOINTLERİ

```
# Yardım Merkezi
GET  /help/categories                  → { success, data: HelpCategory[] }
GET  /help/categories/:slug            → { success, data: HelpCategory (articles dahil) }
GET  /help/articles/:slug              → { success, data: HelpArticle }
GET  /help/articles/popular            → { success, data: HelpArticle[] }
GET  /help/search?q=X                  → { success, data: HelpArticle[] }
POST /help/articles/:id/vote           → { success }  body: { vote: 'up' | 'down' }

# Politikalar / Yasal Metinler
GET  /policies                         → { success, data: Policy[] }
GET  /policies/:slug                   → { success, data: Policy }

# Duyurular
GET  /announcements                    → { success, data: Announcement[] }  query: active
GET  /announcements/:id                → { success, data: Announcement }

# Dinamik İçerik
GET  /content/:key                     → { success, data: DynamicContent }

# SEO Metadata
GET  /seo?path=/help                   → { success, data: SeoMetadata }

# Satıcı Başvurusu
POST /vendors/apply                    → { success }  body: { businessName, taxNumber, description, ... }
```

---

## 1. TİP TANIMLARI — `types/content.ts`

```typescript
import type { BaseEntity } from '~/types/common'

/** Yardım kategorisi */
export interface HelpCategory extends BaseEntity {
  name: string
  title: string
  slug: string
  icon: string | null
  sortOrder: number
  isActive: boolean
  _count?: { articles: number }
  articles?: HelpArticle[]
}

/** Yardım makalesi */
export interface HelpArticle extends BaseEntity {
  title: string
  slug: string
  content: string
  categoryId: string
  category?: HelpCategory
  status: 'DRAFT' | 'PUBLISHED'
  viewCount: number
  upvotes: number
  downvotes: number
  categoryName?: string
  categoryIcon?: string
}

/** Politika / yasal metin */
export interface Policy extends BaseEntity {
  title: string
  slug: string
  content: string
  version: number
}

/** Duyuru */
export interface Announcement extends BaseEntity {
  title: string
  content: string
  startDate: string
  endDate: string
  isActive: boolean
}

/** Dinamik içerik */
export interface DynamicContent {
  key: string
  value: string
  title: string | null
}

/** SEO metadata */
export interface SeoMetadata {
  title: string | null
  description: string | null
  keywords: string | null
  ogImage: string | null
}

/** Vendor başvuru formu */
export interface VendorApplicationInput {
  businessName: string
  taxNumber: string
  mersisNumber?: string
  kepAddress?: string
  description: string
  city: string
  district: string
  phone: string
  bankName?: string
  iban?: string
  accountHolder?: string
}
```

---

## 2. COMPOSABLE'LAR

### 2.1 `composables/useHelp.ts`

```typescript
import type { HelpCategory, HelpArticle } from '~/types/content'
import type { ApiResponse } from '~/types/api'

export function useHelp() {
  const { $api } = useApi()

  async function fetchCategories(): Promise<HelpCategory[]> {
    const response = await $api<ApiResponse<HelpCategory[]>>('help/categories')
    return response.success ? response.data || [] : []
  }

  async function fetchCategory(slug: string): Promise<HelpCategory | null> {
    const response = await $api<ApiResponse<HelpCategory>>(`help/categories/${slug}`)
    return response.success ? response.data : null
  }

  async function fetchArticle(slug: string): Promise<HelpArticle | null> {
    const response = await $api<ApiResponse<HelpArticle>>(`help/articles/${slug}`)
    return response.success ? response.data : null
  }

  async function fetchPopular(): Promise<HelpArticle[]> {
    const response = await $api<ApiResponse<HelpArticle[]>>('help/articles/popular', { showErrorToast: false })
    return response.success ? response.data || [] : []
  }

  async function search(query: string): Promise<HelpArticle[]> {
    if (query.length < 2) return []
    const response = await $api<ApiResponse<HelpArticle[]>>('help/search', {
      query: { q: query }, showErrorToast: false,
    })
    return response.success ? response.data || [] : []
  }

  async function vote(articleId: string, vote: 'up' | 'down'): Promise<boolean> {
    try {
      const response = await $api<ApiResponse<void>>(`help/articles/${articleId}/vote`, {
        method: 'POST', body: { vote },
      })
      return response.success
    } catch { return false }
  }

  return { fetchCategories, fetchCategory, fetchArticle, fetchPopular, search, vote }
}
```

### 2.2 `composables/usePolicies.ts`

```typescript
import type { Policy } from '~/types/content'
import type { ApiResponse } from '~/types/api'

export function usePolicies() {
  const { $api } = useApi()

  async function fetchPolicies(): Promise<Policy[]> {
    const response = await $api<ApiResponse<Policy[]>>('policies', { showErrorToast: false })
    return response.success ? response.data || [] : []
  }

  async function fetchPolicy(slug: string): Promise<Policy | null> {
    const response = await $api<ApiResponse<Policy>>(`policies/${slug}`)
    return response.success ? response.data : null
  }

  return { fetchPolicies, fetchPolicy }
}
```

### 2.3 `composables/useAnnouncements.ts`

```typescript
import type { Announcement } from '~/types/content'
import type { ApiResponse } from '~/types/api'

export function useAnnouncements() {
  const { $api } = useApi()

  async function fetchActive(): Promise<Announcement[]> {
    const response = await $api<ApiResponse<Announcement[]>>('announcements', {
      query: { active: true }, showErrorToast: false,
    })
    return response.success ? response.data || [] : []
  }

  async function fetchAnnouncement(id: string): Promise<Announcement | null> {
    const response = await $api<ApiResponse<Announcement>>(`announcements/${id}`)
    return response.success ? response.data : null
  }

  return { fetchActive, fetchAnnouncement }
}
```

---

## 3. SAYFALAR

### 3.1 `pages/help/index.vue` — Yardım Merkezi Ana Sayfa

Mevcut tasarımı koru — çok güzel bir yardım merkezi:

```
Layout: default

Yapı:
- Hero bölüm (turuncu gradient):
  - Başlık: "Size nasıl yardımcı olabiliriz?"
  - Arama input (debounced, sonuç dropdown'ı)
- Kategori kartları grid (3 kolon):
  - Her kart: ikon + başlık + makale sayısı
  - Tıklayınca → /help/category/:slug
- Popüler sorular accordion:
  - Soru başlığı tıklanınca içerik açılır/kapanır
  - "Detaylı Görüntüle" linki → /help/article/:slug
- İletişim kutusu (sidebar):
  - Canlı destek butonu
  - Çağrı merkezi bilgisi

Composable: useHelp() — fetchCategories, fetchPopular, search
Arama: 300ms debounce, min 2 karakter
```

### 3.2 `pages/help/category/[slug].vue` — Yardım Kategori Sayfası

```
Yapı:
- Dark header: geri butonu + kategori ikonu + başlık + makale sayısı
- Makale listesi kartları:
  - Başlık + içerik önizleme (150 karakter)
  - Tıklayınca → /help/article/:slug
- Boş state: "Henüz makale yok"

Composable: useHelp().fetchCategory(slug)
SSR: useAsyncData ile
```

### 3.3 `pages/help/article/[slug].vue` — Yardım Makale Detay

```
Yapı:
- Sticky breadcrumb: Yardım > Kategori > Makale adı
- Başlık (h1)
- İçerik (prose sınıfı ile formatlı)
- Geri bildirim: "Bu makale yardımcı oldu mu?" → Evet / Hayır butonları → vote() API

Composable: useHelp().fetchArticle(slug), vote()
SSR: useAsyncData ile
SEO: useAppSeo ile dinamik title
```

### 3.4 `pages/policies/[slug].vue` — Politika Sayfası

```
Yapı:
- Beyaz kart içinde:
  - Başlık (h1)
  - İçerik (prose, whitespace-pre-line)
  - Son güncelleme tarihi
- Bulunamazsa: "Belge bulunamadı" + ana sayfaya dön

Composable: usePolicies().fetchPolicy(slug)
SSR: useAsyncData ile

Erişilecek slug'lar: gizlilik-politikasi, kullanim-kosullari, kvkk, iade-politikasi, vb.
```

### 3.5 `pages/announcements/index.vue` — Duyuru Listesi

```
Yapı:
- Başlık: "Duyurular"
- Duyuru kartları listesi:
  - Başlık + içerik önizleme + tarih aralığı
  - Tıklayınca → /announcements/:id
- Boş state

Composable: useAnnouncements().fetchActive()
```

### 3.6 `pages/announcements/[id].vue` — Duyuru Detay

```
Yapı:
- Başlık + tarih aralığı
- İçerik (prose)
- Geri butonu
```

### 3.7 `pages/become-vendor.vue` — Satıcı Başvuru Sayfası

```
Layout: default

Yapı:
- Hero bölüm: "BarterBorsa'da Satıcı Olun" başlığı + avantajlar listesi
- Avantaj kartları (3-4 adet): komisyon oranları, geniş müşteri kitlesi, ücretsiz mağaza, vb.
- Başvuru formu:
  - İşletme Adı (required)
  - Vergi Numarası (required)
  - MERSIS Numarası
  - KEP Adresi
  - Açıklama (textarea)
  - İl / İlçe
  - Telefon
  - Banka bilgileri (opsiyonel): banka adı, IBAN, hesap sahibi
  - "Başvuru Yap" butonu

Submit: POST /vendors/apply → başarılı → "Başvurunuz alındı, inceleme sonrası size dönüş yapılacaktır" mesajı

Auth kontrolü: giriş yapmamışsa → /auth/login redirect
Zaten vendor ise → /vendor redirect
```

---

## 4. SON DOKUNUŞLAR

### 4.1 Error Sayfası — `error.vue` (Nuxt root level)

```vue
<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error.statusCode === 404)
const title = computed(() => is404.value ? 'Sayfa Bulunamadı' : 'Bir Hata Oluştu')
const description = computed(() => is404.value
  ? 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.'
  : 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
)

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 px-4">
    <div class="text-center max-w-md">
      <p class="text-8xl font-display font-bold text-brand-600 mb-4">
        {{ error.statusCode }}
      </p>
      <h1 class="text-2xl font-bold text-surface-900 mb-2">{{ title }}</h1>
      <p class="text-surface-500 mb-8">{{ description }}</p>
      <UiButton @click="handleError">Anasayfaya Dön</UiButton>
    </div>
  </div>
</template>
```

### 4.2 Performans İyileştirmeleri

Bu bölümde tüm projedeki performans sorunlarını kontrol et ve düzelt:

```
1. Lazy Loading:
   - Tüm sayfa route'ları zaten Nuxt ile lazy — OK
   - Ağır component'ler: defineAsyncComponent kullan (admin tabloları, chart'lar)
   - Görseller: NuxtImg ile lazy load + placeholder

2. Bundle Analizi:
   - Kullanılmayan import'ları temizle
   - @heroicons/vue → sadece kullanılan ikonları import et (tree-shake zaten yapıyor ama kontrol et)
   - socket.io-client → sadece client-side import

3. Nuxt Image:
   - Tüm img tag'lerini NuxtImg ile değiştir (özellikle ürün görselleri)
   - format="webp" + quality="80" + placeholder ekle

4. Composable Optimization:
   - useAsyncData key'lerinin benzersiz olduğunu doğrula
   - Gereksiz refetch'leri önle (cache stratejisi)
```

### 4.3 Erişilebilirlik (Accessibility)

```
1. Form Elemanları:
   - Tüm input'larda label (UiInput zaten yapıyor — doğrula)
   - Tüm butonlarda aria-label (ikon-only butonlar için)
   - Form hata mesajları aria-live="polite" ile

2. Keyboard Navigation:
   - Modal'larda focus trap (UiModal zaten yapıyor — doğrula)
   - Tab order mantıklı
   - ESC ile modal/dropdown kapatma

3. Renk Kontrastı:
   - WCAG AA minimum — surface-500 metin surface-0 arka plan üzerinde kontrol et
   - Hata mesajları: danger-600 on white → OK

4. Semantic HTML:
   - Başlıklar: h1 → h2 → h3 sıralı
   - nav, main, aside, footer etiketleri doğru kullanılmış mı kontrol et
   - Listelerde ul/ol kullan (div yerine)
```

### 4.4 Hata Yönetimi Kontrolü

```
1. Her sayfada 3 state olmalı: loading + error + empty + data
2. API hataları: useApi zaten toast gösteriyor — ama sayfa seviyesinde de error state göster
3. Offline durumu: navigator.onLine kontrolü (opsiyonel banner)
4. 404 catch-all: pages/[...slug].vue zaten var (Bölüm 1'de yazıldı)
```

### 4.5 AppFooter Güncelleme — `components/app/AppFooter.vue`

Bölüm 1'de placeholder olarak yazıldı. Şimdi tam implementasyon:

```
Yapı (4 kolon):
1. Marka: Logo + açıklama + sosyal medya ikonları
2. Alışveriş: Ürünler, Kategoriler, Kampanyalar, Markalar
3. Kurumsal: Hakkımızda, İletişim, Satıcı Ol, Premium
4. Yasal: Kullanım Koşulları, Gizlilik Politikası, KVKK, İade Politikası

Alt bar: © 2026 BarterBorsa. Tüm hakları saklıdır.

Tüm linkler NuxtLink ile.
```

### 4.6 AnnouncementBar — `components/common/AnnouncementBar.vue`

Aktif duyuruları sayfa üstünde banner olarak göster:

```
Props: page?: string (hangi sayfada gösterilecek — opsiyonel filtre)

Yapı:
- useAnnouncements().fetchActive() ile aktif duyuruları çek
- İlk duyuruyu göster: arka plan rengi + başlık + kapatma butonu
- Kapatıldığında: sessionStorage ile hatırla, tekrar gösterme
```

---

## 5. COMPONENT'LER

### 5.1 `components/help/`

```
HelpCategoryCard.vue       — Kategori kartı (ikon + başlık + makale sayısı)
  Props: category: HelpCategory

HelpArticleCard.vue        — Makale kartı (başlık + önizleme)
  Props: article: HelpArticle

HelpSearchBar.vue          — Yardım arama (debounced + sonuç dropdown)
  Props: (yok)
  Emits: (yok — kendi içinde navigasyon yapar)

HelpAccordion.vue          — Popüler sorular accordion
  Props: articles: HelpArticle[]

HelpFeedback.vue           — "Yardımcı oldu mu?" bileşeni
  Props: articleId: string
  Emits: voted
```

### 5.2 `components/content/`

```
PolicyContent.vue          — Politika içeriği render
  Props: policy: Policy

AnnouncementBanner.vue     — Üst duyuru banner'ı
  Props: announcement: Announcement
  Emits: close
```

### 5.3 `components/common/AnnouncementBar.vue`

Yukarıda açıklandı.

---

## 6. i18n — `locales/tr.json`'a ekle

```json
{
  "help": {
    "title": "Yardım Merkezi",
    "heroTitle": "Size nasıl yardımcı olabiliriz?",
    "heroSubtitle": "Siparişleriniz, kargo süreçleri ve iadeler hakkında merak ettikleriniz",
    "searchPlaceholder": "Ne aramıştınız? (örn: iade, kargo takibi...)",
    "noResults": "Sonuç bulunamadı",
    "popularQuestions": "En Çok Merak Edilenler",
    "viewDetail": "Detaylı Görüntüle",
    "needMoreHelp": "Hala yardıma mı ihtiyacınız var?",
    "liveChat": "Canlı Destek",
    "startChat": "Sohbeti Başlat",
    "callCenter": "Çağrı Merkezi",
    "workingHours": "Hafta içi 09:00 - 18:00",
    "backToHelp": "Yardım Merkezine Dön",
    "articles": "makale",
    "noArticles": "Henüz makale yok",
    "categoryNotFound": "Kategori bulunamadı",
    "articleNotFound": "Makale bulunamadı",
    "feedback": "Bu makale yardımcı oldu mu?",
    "feedbackSubtitle": "Görüşleriniz bizim için önemli",
    "yes": "Evet",
    "no": "Hayır",
    "thanksFeedback": "Geri bildiriminiz için teşekkürler!"
  },
  "policies": {
    "title": "Yasal Metinler",
    "lastUpdated": "Son Güncelleme",
    "notFound": "Belge bulunamadı",
    "privacy": "Gizlilik Politikası",
    "terms": "Kullanım Koşulları",
    "kvkk": "KVKK Aydınlatma Metni",
    "refund": "İade Politikası"
  },
  "announcements": {
    "title": "Duyurular",
    "noAnnouncements": "Aktif duyuru bulunmuyor"
  },
  "becomeVendor": {
    "title": "BarterBorsa'da Satıcı Olun",
    "subtitle": "Binlerce potansiyel müşteriye ulaşın",
    "benefits": {
      "commission": "Rekabetçi Komisyon Oranları",
      "commissionDesc": "Sektörün en düşük komisyon oranlarıyla satış yapın",
      "reach": "Geniş Müşteri Kitlesi",
      "reachDesc": "Binlerce aktif kullanıcıya ürünlerinizi sergileyin",
      "free": "Ücretsiz Mağaza",
      "freeDesc": "Mağaza açma ve listeleme ücreti yok",
      "barter": "Takas İmkanı",
      "barterDesc": "Fazla stoklarınızı ihtiyacınız olan ürünlerle takas edin"
    },
    "form": {
      "businessName": "İşletme Adı",
      "taxNumber": "Vergi Numarası",
      "mersisNumber": "MERSIS Numarası",
      "kepAddress": "KEP Adresi",
      "description": "İşletme Açıklaması",
      "city": "İl",
      "district": "İlçe",
      "phone": "Telefon",
      "bankInfo": "Banka Bilgileri (Opsiyonel)",
      "bankName": "Banka Adı",
      "iban": "IBAN",
      "accountHolder": "Hesap Sahibi",
      "submit": "Başvuru Yap",
      "submitting": "Gönderiliyor...",
      "success": "Başvurunuz alındı! İnceleme sonrası size dönüş yapılacaktır.",
      "alreadyVendor": "Zaten satıcı hesabınız var"
    }
  },
  "footer": {
    "description": "Türkiye'nin en büyük ticari takas ve e-ticaret platformu",
    "shopping": "Alışveriş",
    "products": "Ürünler",
    "categories": "Kategoriler",
    "campaigns": "Kampanyalar",
    "brands": "Markalar",
    "corporate": "Kurumsal",
    "about": "Hakkımızda",
    "contact": "İletişim",
    "becomeVendor": "Satıcı Ol",
    "premium": "Premium",
    "legal": "Yasal",
    "privacy": "Gizlilik Politikası",
    "terms": "Kullanım Koşulları",
    "kvkk": "KVKK",
    "refund": "İade Politikası",
    "copyright": "© 2026 BarterBorsa. Tüm hakları saklıdır."
  },
  "errors": {
    "pageNotFound": "Sayfa Bulunamadı",
    "pageNotFoundDesc": "Aradığınız sayfa mevcut değil veya taşınmış olabilir",
    "serverError": "Bir Hata Oluştu",
    "serverErrorDesc": "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin",
    "goHome": "Anasayfaya Dön"
  }
}
```

---

## 7. SON KONTROL LİSTESİ

Bu bölümün sonunda tüm proje için şu kontrolleri yap:

```
✅ pnpm build → 0 hata
✅ pnpm typecheck → 0 hata, 0 any, 0 warning
✅ Tüm sayfalar responsive (375px, 768px, 1024px, 1440px)
✅ Tüm formlar: label + error state + disabled state
✅ Tüm API çağrıları: loading + error + empty + data state
✅ Tüm modal'lar: ESC ile kapatılır, backdrop click kapatır
✅ Tüm NuxtLink'ler: doğru path
✅ i18n: tüm string'ler tr.json'dan (hardcoded Türkçe metin yok)
✅ useAppSeo: her sayfada doğru title + description
✅ SSR: sayfa kaynağında içerik var (view-source kontrol)
✅ Auth: korumalı sayfalar login redirect, guest sayfalar authenticated redirect
```

---

## 8. DOĞRULAMA KRİTERLERİ

1. `pnpm build` → 0 hata
2. `pnpm typecheck` → 0 hata, 0 `any`
3. `/help` → Yardım merkezi: arama, kategoriler, popüler sorular accordion
4. `/help/category/:slug` → Kategori makaleleri listesi
5. `/help/article/:slug` → Makale detay + geri bildirim butonları
6. `/policies/:slug` → Politika sayfası (gizlilik, kullanım koşulları, kvkk)
7. `/announcements` → Duyuru listesi
8. `/become-vendor` → Satıcı başvuru formu (auth kontrolü, zaten vendor kontrolü)
9. `error.vue` → 404 ve 500 hata sayfaları düzgün render
10. AppFooter → 4 kolon, tüm linkler çalışır
11. AnnouncementBar → Aktif duyuru banner, kapatılabilir
12. Tüm sayfalar SSR ile render (view-source'da içerik var)
13. Tüm sayfalar mobile responsive
14. i18n: hardcoded Türkçe metin kalmamış

---

## 9. DOSYA YAPISI (Bölüm 10)

```
types/content.ts

composables/
├── useHelp.ts
├── usePolicies.ts
└── useAnnouncements.ts

components/
├── help/
│   ├── HelpCategoryCard.vue
│   ├── HelpArticleCard.vue
│   ├── HelpSearchBar.vue
│   ├── HelpAccordion.vue
│   └── HelpFeedback.vue
├── content/
│   ├── PolicyContent.vue
│   └── AnnouncementBanner.vue
├── common/
│   └── AnnouncementBar.vue
└── app/
    └── AppFooter.vue              # GÜNCELLENDİ — tam implementasyon

pages/
├── help/
│   ├── index.vue
│   ├── category/[slug].vue
│   └── article/[slug].vue
├── policies/
│   └── [slug].vue
├── announcements/
│   ├── index.vue
│   └── [id].vue
└── become-vendor.vue

error.vue                          # Root level hata sayfası

locales/tr.json                    # GÜNCELLENDİ — help, policies, announcements, becomeVendor, footer, errors
```

> **Not:** Bu son bölüm. Her dosyayı tam implementasyonla yaz. Yardım merkezi arama (debounced dropdown), makale geri bildirim (up/down vote), accordion, satıcı başvuru formu — tümü çalışır durumda. AppFooter tam 4 kolon. error.vue hem 404 hem 500 için. Son kontrol listesindeki tüm maddeleri karşıla. Proje tamamlandığında `pnpm build` + `pnpm typecheck` temiz geçmeli.
