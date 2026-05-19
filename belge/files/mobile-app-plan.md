# 📱 BazarX iPhone Mobil Uygulama Planı

> **Veritabanı:** MongoDB + Mongoose. Prisma/PostgreSQL kaldırıldı.
> Backend API endpoint'leri değişmez — mobil uygulama sadece REST API tüketir.

## Tech Stack

| Katman | Teknoloji | Neden |
|---|---|---|
| Framework | **React Native (Expo)** | Web composable'ları hook'a kolay port, TypeScript ortak |
| State | **Zustand** | Pinia → Zustand 1:1 geçiş |
| Navigation | **Expo Router** (file-based) | Nuxt routing mantığıyla aynı |
| Styling | **NativeWind** | Tailwind class'ları aynı kalır |
| API | **Axios + React Query** | Mevcut `/api/v1/*` endpoint'ler değişmez |
| Auth | **Expo SecureStore** | JWT token güvenli saklama |
| Socket | **Socket.io-client** | Mevcut socket server değişmez |
| Medya | **Expo Image** | MinIO URL'leri doğrudan kullanır |

---

## Faz Planı

### 🔴 FAZ 1 — MVP (Tamamlandı) ✅

**Auth & Onboarding**
- [x] Login / Register / Email doğrulama
- [x] JWT + SecureStore Entegrasyonu
- [x] Profil tamamlama, adres ekleme

**Catalog & Ürünler**
- [x] Ana sayfa (öne çıkan ürünler, kategoriler)
- [x] Ürün listesi — arama + filtre
- [x] Ürün detay sayfası (Listing ID entegrasyonu ile)

**Commerce (Alışveriş)**
- [x] Sepet (Cart) — Local + Backend Merge Senkronizasyonu
- [x] Checkout → Ödeme (Cüzdan Entegrasyonu)
- [x] Sipariş listesi ve takibi (Gerçek veri)
- [x] Cüzdan bakiye görüntüleme (Ana Hesap, XP ve Hediye Kartları)

---

### 🟡 FAZ 2 — Takas Modülü (Tamamlandı) ✅

**Surplus / İlan**
- [x] İlan listeleme (takas havuzu) — `app/trade/surplus/index.tsx`
- [x] İlan oluşturma (foto çek / yükle) — `app/trade/surplus/create.tsx`
- [x] İlan detay sayfası — `app/trade/surplus/[id].tsx`

**Trade Offer Akışı**
- [x] Teklif ver / al — `app/trade/offer/new/[id].tsx`
- [x] Teklif görüntüleme — `app/trade/offer/[id].tsx`
- [x] Mobil Inbox ekranı — `app/(tabs)/takas.tsx`

**Swap Session**
- [x] Kargo bilgisi girme — `app/trade/swap/[id].tsx`
- [x] Teslimat onaylama — `confirmReceipt` entegrasyonu
- [x] Takas oturumu yönetimi

> **Not:** `SurplusItem._id` ObjectId formatındadır. API'den gelen `_id` alanları string'e cast edilerek kullanılır.

---

### 🟢 FAZ 3 — Açık Artırma & Sadakat (Tamamlandı) ✅

**Auction**
- [x] Açık artırmaları listele — `app/auction/index.tsx`
- [x] Detay + Katılım (teminat) — `app/auction/[id].tsx`
- [x] Teklif ver (bid) — modal + 5sn polling ile son teklifler

**Lottery**
- [x] Çekilişler listesi — `app/lottery/index.tsx` (progress bar)
- [x] Bilet satın alma — `app/lottery/[id].tsx` (qty selector + onay)

**Loyalty & XP**
- [x] XP / Tier gösterimi (Cüzdan sayfasında)
- [x] Rozet koleksiyonu — `app/profile/badges.tsx`
- [x] Referans kodu — `app/profile/referral.tsx`

**Hooks**
- [x] `hooks/useAuction.ts`
- [x] `hooks/useLottery.ts`
- [x] `hooks/useLoyalty.ts`

---

### 🔵 FAZ 4 — Satıcı Paneli (Tamamlandı) ✅

**Vendor Onboarding**
- [x] Satıcı başvuru ekranı — `app/vendor/apply.tsx`
- [x] Profile'da koşullu CTA

**Dashboard**
- [x] `app/vendor/dashboard.tsx` — bugünün cirosu, 4 stat, trust score bar

**Ürün Yönetimi**
- [x] `app/vendor/products/index.tsx`
- [x] `app/vendor/products/create.tsx`
- [x] `app/vendor/products/[id].tsx`

**Sipariş Yönetimi**
- [x] `app/vendor/orders/index.tsx`
- [x] `app/vendor/orders/[id].tsx`

**Analitik**
- [x] `app/vendor/analytics.tsx`

**Hooks**
- [x] `hooks/useVendor.ts`

---

### 🟣 FAZ 5 — Barter Engine & Fabrika Ekosistemi (Planlanıyor)

> Bu faz backend Faz 7 (Barter Engine) tamamlandıktan sonra başlar.

**MatchPreference Seçimi**
- [ ] İlan oluştururken kısmi eşleşme tercihi seçimi — `app/trade/surplus/create.tsx` güncellenmeli
  - `FULL_ONLY` / `PARTIAL_ACCEPT` / `PARTIAL_CASH_DIFF` radio seçimi
- [ ] Teklif detay sayfasında tercih gösterimi — `app/trade/offer/[id].tsx`

**Batch Matching Bildirimleri**
- [ ] Her gece 02:00 batch sonrası push notification
  - "Takasınız eşleşti!" → `app/trade/swap/[id].tsx`'e deep link
  - "Kısmi eşleşme: X birim eşleşti, Y birim bekliyor"
- [ ] `hooks/useMatchNotification.ts` — socket veya polling ile eşleşme durumu takibi

**Swap Session Güncellemeleri**
- [ ] `app/trade/swap/[id].tsx` — kısmi eşleşme UI (eşleşen miktar / bekleyen miktar)
- [ ] Nakit fark ödeme akışı (`PARTIAL_CASH_DIFF` senaryosu) — Cüzdan entegrasyonu

**Fabrika Ekosistemi (Yeni Modül)**
- [ ] `app/ecosystem/` klasörü
  - `app/ecosystem/index.tsx` — fabrika ürün gamı listesi (sadece ekosistem bayilerine görünür)
  - `app/ecosystem/product/[id].tsx` — ürün detay + Watchover kota gösterimi
  - `app/ecosystem/order/new.tsx` — sipariş oluşturma (maxOrderQtyPerDealer kontrolü)
  - `app/ecosystem/garage-sale/index.tsx` — aktif Garaj Günü kampanyaları
  - `app/ecosystem/garage-sale/[id].tsx` — flash sale satın alma (stok sayacı)

**Fabrika Paneli (APEX kullanıcılar)**
- [ ] `app/factory/` klasörü
  - `app/factory/dashboard.tsx` — bayi listesi, stok hareketleri
  - `app/factory/products/index.tsx` — ürün gamı yönetimi
  - `app/factory/products/[id]/visibility.tsx` — görünürlük ayarları (kime, ne zaman)
  - `app/factory/garage-sale/create.tsx` — Garaj Günü kampanyası oluşturma
  - `app/factory/dealers/index.tsx` — bayi listesi + TrustScore

**Hooks (Faz 5)**
- [ ] `hooks/useEcosystem.ts` — useEcosystemProducts, useEcosystemOrder, useGarageSale
- [ ] `hooks/useFactory.ts` — useFactoryDashboard, useFactoryDealers, useProductVisibility

---

### 🟠 FAZ 6 — Platform Paritet (Trendyol Eksikleri)

**İade Yönetimi**
- [ ] `app/orders/[id]/return.tsx` — iade talebi oluşturma
  - İade gerekçesi seçimi (ayıplı ürün / cayma hakkı / yanlış ürün)
  - Fotoğraf yükleme (kanıt)
  - Kargo kodu görüntüleme
- [ ] `app/orders/[id]/return-status.tsx` — iade adım takibi
- [ ] `app/vendor/returns/index.tsx` — gelen iade talepleri listesi
- [ ] `app/vendor/returns/[id].tsx` — iade onay/red ekranı (48s countdown göstergesi)
- [ ] `hooks/useReturn.ts` — useCreateReturn, useReturnStatus, useVendorReturns, useApproveReturn

**Satıcı Puanlama**
- [ ] `app/vendor/score.tsx` — mağaza puanı detay sayfası
  - 4 bileşen bar chart (zamanında kargo / iptal / iade / yorum)
  - Puan geçmişi trendi
  - İhlal listesi + itiraz butonu
- [ ] Vendor dashboard'a puan widget'ı eklenmeli — `app/vendor/dashboard.tsx`
- [ ] `hooks/useVendorScore.ts` — useVendorScore, useViolations, useAppealViolation

**Kargo Takibi**
- [ ] `app/orders/[id]/tracking.tsx` — adım adım kargo timeline
  - Kargo firması logosu + tracking no
  - LABEL_CREATED → PICKED_UP → IN_TRANSIT → DELIVERED adımları
  - Tahmini teslimat tarihi
- [ ] Sipariş listesinde mini durum badge'i — `app/orders/index.tsx`
- [ ] `hooks/useTracking.ts` — useOrderTracking, useRefreshTracking

**Buybox**
- [ ] Ürün detay sayfasına "Diğer satıcılar" bölümü — `app/product/[id].tsx`
  - Buybox kazanan vurgulanır (yeşil rozet)
  - Diğer satıcılar fiyat + puan + teslimat ile listelenir
- [ ] `hooks/useProductOffers.ts` — useProductOffers

**Erken Ödeme**
- [ ] `app/vendor/early-payment.tsx`
  - Çekilebilir bakiye gösterimi
  - Faiz simülasyonu (gün seçimi → maliyet hesabı)
  - Talep oluştur + geçmiş talepler
- [ ] `hooks/useEarlyPayment.ts` — useEarlyPaymentEligible, useRequestEarlyPayment

**E-Fatura**
- [ ] `app/orders/[id]/invoice.tsx` — fatura görüntüleme + PDF indirme
- [ ] `app/vendor/invoices/index.tsx` — satıcı fatura listesi
- [ ] `hooks/useInvoice.ts` — useOrderInvoice, useVendorInvoices

> Backend MongoDB'ye geçtiği için tüm `id` alanları artık **ObjectId (24 karakter hex string)** formatındadır.

```typescript
// Doğru kullanım — API'den gelen _id'yi string olarak kullan
const productId = product._id.toString();

// Expo Router parametresinde
const { id } = useLocalSearchParams<{ id: string }>();
// id değeri: "6645f1a2b3c4d5e6f7a8b9c0" gibi ObjectId string

// API çağrısında
await axios.get(`/api/v1/products/${id}`);
```

**Dikkat edilecek noktalar:**
- Eski `parseInt(id)` veya sayısal ID karşılaştırması kullanılmıyorsa sorun yok
- Zustand store'larında ID'ler `string` tipinde tutulur
- React Query cache key'lerinde ID string olarak kullanılır

---

## Ekran Mimarisi (GÜNCEL)

```
app/
├── (auth)/
│   ├── login.tsx              ✅
│   ├── register.tsx           ✅
│   └── verify-email.tsx       ✅
├── (tabs)/
│   ├── index.tsx              ✅ (Ana Sayfa)
│   ├── explore.tsx            ← Ürün keşif
│   ├── takas.tsx              ✅ (Takas Inbox)
│   ├── auctions.tsx           ← Artırmalar
│   └── profile.tsx            ✅
├── product/
│   ├── list.tsx               ✅
│   └── [id].tsx               ✅
├── checkout/
│   └── index.tsx              ✅
├── orders/
│   ├── index.tsx              ✅ → Faz 6'da kargo mini badge eklenmeli
│   ├── [id].tsx               ✅
│   ├── [id]/return.tsx        🔲 İade talebi (Faz 6)
│   ├── [id]/return-status.tsx 🔲 İade takibi (Faz 6)
│   ├── [id]/tracking.tsx      🔲 Kargo timeline (Faz 6)
│   └── [id]/invoice.tsx       🔲 Fatura görüntüle (Faz 6)
├── wallet/
│   └── index.tsx              ✅
├── trade/
│   ├── surplus/
│   │   ├── index.tsx          ✅ (Takas Havuzu)
│   │   ├── create.tsx         ✅ → Faz 5'te matchPreference eklenmeli
│   │   └── [id].tsx           ✅
│   ├── offer/
│   │   ├── new/[id].tsx       ✅
│   │   └── [id].tsx           ✅
│   └── swap/
│       └── [id].tsx           ✅ → Faz 5'te kısmi eşleşme UI eklenmeli
├── ecosystem/                 ← FAZ 5 (Yeni)
│   ├── index.tsx              🔲 Fabrika ürün gamı
│   ├── product/[id].tsx       🔲 Ürün detay + kota
│   ├── order/new.tsx          🔲 Sipariş oluştur
│   └── garage-sale/
│       ├── index.tsx          🔲 Aktif flash sale'ler
│       └── [id].tsx           🔲 Flash sale satın alma
├── factory/                   ← FAZ 5 (Yeni — APEX)
│   ├── dashboard.tsx          🔲
│   ├── products/
│   │   ├── index.tsx          🔲
│   │   └── [id]/visibility.tsx 🔲
│   ├── garage-sale/
│   │   └── create.tsx         🔲
│   └── dealers/
│       └── index.tsx          🔲
├── auction/
│   ├── index.tsx              ✅
│   └── [id].tsx               ✅
├── lottery/
│   ├── index.tsx              ✅
│   └── [id].tsx               ✅
├── vendor/
│   ├── apply.tsx              ✅
│   ├── dashboard.tsx          ✅ → Faz 6'da puan widget eklenmeli
│   ├── analytics.tsx          ✅
│   ├── score.tsx              🔲 Mağaza puanı (Faz 6)
│   ├── early-payment.tsx      🔲 Erken ödeme (Faz 6)
│   ├── invoices/
│   │   └── index.tsx          🔲 Fatura listesi (Faz 6)
│   ├── returns/
│   │   ├── index.tsx          🔲 İade talepleri (Faz 6)
│   │   └── [id].tsx           🔲 İade onay/red (Faz 6)
│   ├── products/
│   │   ├── index.tsx          ✅
│   │   ├── create.tsx         ✅
│   │   └── [id].tsx           ✅
│   └── orders/
│       ├── index.tsx          ✅
│       └── [id].tsx           ✅
└── profile/
    ├── addresses.tsx          ✅
    ├── payment.tsx            ✅
    ├── badges.tsx             ✅
    └── referral.tsx           ✅
```

---

## API Notları

```typescript
// Tüm liste endpoint'leri MongoDB pagination döner
interface MongoPage<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  // NOT: SQL'deki offset pagination yok, cursor-based olabilir
}

// Hata kodları (backend'den gelen özel hatalar)
const BARTER_ERRORS = {
  POOL_LIMIT_EXCEEDED:          'Havuz limiti doldu',
  DEALER_QUOTA_EXCEEDED:        'Bayi kotası aşıldı',
  GARAGE_SALE_STOCK_EXHAUSTED:  'Garaj günü stoğu tükendi',
  BARTER_NOT_ALLOWED_IN_ECOSYSTEM: 'Ekosistem içinde takas yapılamaz',
  PRICE_FLOOR_VIOLATION:        'Fiyat taban değerinin altında',
};
```
