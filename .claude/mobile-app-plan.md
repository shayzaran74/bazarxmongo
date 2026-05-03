# 📱 BazarX iPhone Mobil Uygulama Planı

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
- [x] Sepet (Cart) - Local + Backend Merge Senkronizasyonu
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
- [x] Rozet koleksiyonu — `app/profile/badges.tsx` (kazanılan/kilitli ayrımı)
- [x] Referans kodu — `app/profile/referral.tsx` (kopyala + native Share)

**Hooks**
- [x] `hooks/useAuction.ts` — useAuctions, useAuctionDetail, useAuctionBids, useParticipate, usePlaceBid
- [x] `hooks/useLottery.ts` — useLotteries, useLotteryDetail, useBuyTicket
- [x] `hooks/useLoyalty.ts` — useBadges, useReferralStats

**Entegrasyon**
- [x] Ana sayfa quick menu: Ürünler / Takas / Artırma / Çekiliş
- [x] Profil menüsünde: Rozetlerim, Davet Et, Açık Artırmalar, Çekilişler

---

### 🔵 FAZ 4 — Satıcı Paneli (Tamamlandı) ✅

**Vendor Onboarding**
- [x] Satıcı başvuru ekranı — `app/vendor/apply.tsx` (firma + vergi + adres)
- [x] Profile'da koşullu CTA (vendor değilse "Satıcı Ol", ise "Mağaza Paneli")

**Dashboard**
- [x] `app/vendor/dashboard.tsx` — bugünün cirosu (hero), 4 stat (toplam/bekleyen/aktif/puan), trust score bar, hızlı işlemler 2x2

**Ürün Yönetimi**
- [x] `app/vendor/products/index.tsx` — liste + status badge + sil/düzenle aksiyonları
- [x] `app/vendor/products/create.tsx` — ekleme formu (başlık, açıklama, fiyat, stok, kategori)
- [x] `app/vendor/products/[id].tsx` — düzenleme (aynı form, edit mode)

**Sipariş Yönetimi**
- [x] `app/vendor/orders/index.tsx` — status filter (Tümü/Bekleyen/Hazırlanıyor/Kargoda/Teslim)
- [x] `app/vendor/orders/[id].tsx` — 5 adımlı status stepper, müşteri bilgisi, ürün listesi, "→ SONRAKİ ADIM" butonu

**Analitik**
- [x] `app/vendor/analytics.tsx` — Conversion + Avg Sepet kartları, son 7 gün ciro bar chart (custom SVG-free), top 5 satılan ürün

**Hooks**
- [x] `hooks/useVendor.ts` — useVendorDashboard, useVendorProducts/Detail/Create/Update/Delete, useVendorOrders/Detail, useUpdateOrderStatus, useVendorAnalytics, useApplyVendor

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
│   ├── takas.tsx              ✅ (Takas Inbox/Kutusu)
│   ├── auctions.tsx           ← Artırmalar
│   └── profile.tsx            ✅
├── product/
│   ├── list.tsx               ✅
│   └── [id].tsx               ✅
├── checkout/
│   └── index.tsx              ✅
├── orders/
│   ├── index.tsx              ✅
│   └── [id].tsx               ✅
├── wallet/
│   └── index.tsx              ✅
├── trade/                     ← TAKAS MODÜLÜ (CONSOLIDATED)
│   ├── surplus/
│   │   ├── index.tsx          ✅ (Takas Havuzu)
│   │   ├── create.tsx         ✅ (İlan Ver)
│   │   └── [id].tsx           ✅ (İlan Detay)
│   ├── offer/
│   │   ├── new/[id].tsx       ✅ (Teklif Yap)
│   │   └── [id].tsx           ✅ (Teklif Detay)
│   └── swap/
│       └── [id].tsx           ✅ (Takas Oturumu)
└── profile/
    ├── addresses.tsx          ✅
    └── payment.tsx           ✅
```
