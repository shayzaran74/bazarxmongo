# Şişmiş Dosya Modülerleştirme Planı

7 adet büyük Vue dosyası tek tek analiz edildi. Her biri için bileşen ayrıştırma haritası, composable planı ve hedef satır sayıları aşağıda detaylandırılmıştır.

> [!IMPORTANT]
> Plan 4 faz halinde, her faz sonunda `pnpm type-check` + `pnpm dev` testi yapılarak ilerleyecektir.
> Her faz sonunda değişiklikler commit + push edilecektir.

---

## Faz 1 — Marka Yönetimi (admin/brands + vendor/brands) ≈3100 satır

En büyük iki dosya birbirine çok benzer yapıda (istatistik kartları, tablo, modal'lar). Ortak yardımcı fonksiyonlar paylaşılabilir.

---

### 1.1 `admin/brands.vue` — 1736 satır → ~200 satır

**Yapı Analizi:**
- Satır 1–105: Header + istatistik kartları (5 KPI)
- Satır 107–197: Tab bar + filtreler + arama + alfabe
- Satır 199–342: Bekleyen başvurular sekme (kart görünümü + pagination)
- Satır 344–515: Tüm markalar sekme (tablo + pagination)
- Satır 517–619: İhlaller sekmesi
- Satır 622–937: İnceleme modali (belge önizleme + karar aksiyonları)
- Satır 939–1102: Marka formu modali (oluştur/düzenle)
- Satır 1104–1221: İhlal detay modali
- Satır 1225–1716: Script (API fonksiyonları, helpers, state)

**Çıkarılacak Bileşenler:**

| Bileşen | Kaynak Satırlar | Açıklama |
|---------|----------------|----------|
| `components/admin/brands/BrandStatsCards.vue` | 28–105 | 5 KPI kartı |
| `components/admin/brands/BrandTabBar.vue` | 107–132 | Tab navigasyonu |
| `components/admin/brands/BrandFilters.vue` | 134–197 | Arama + durum filtresi + alfabe |
| `components/admin/brands/BrandPendingList.vue` | 199–342 | Bekleyen başvuru kartları + pagination |
| `components/admin/brands/BrandTable.vue` | 344–515 | Tüm markalar tablosu + pagination |
| `components/admin/brands/BrandViolationList.vue` | 517–619 | İhlal kartları listesi |
| `components/admin/brands/BrandReviewModal.vue` | 622–937 | Side-by-side inceleme modali |
| `components/admin/brands/BrandFormModal.vue` | 939–1102 | Marka oluştur/düzenle formu |
| `components/admin/brands/BrandViolationModal.vue` | 1104–1221 | İhlal detay modali |

**Çıkarılacak Composable:**

#### [NEW] `composables/useAdminBrands.ts`
- `fetchBrands()`, `fetchViolations()`, `approveBrand()`, `rejectBrand()`, `requestDocs()`, `saveBrand()`, `deleteBrand()`, `updateViolation()`, `resolveViolationQuickly()`
- Tüm reactive state (`brands`, `loading`, `brandStats`, vs.)
- Helper fonksiyonlar: `getStatusBadgeClass()`, `getStatusLabel()`, `getApplicationTypeBadge()`, `getApplicationTypeLabel()`, `getSeverityBadgeClass()`, `getSeverityLabel()`, `isImageUrl()`, `formatDate()`

**Ortak Util (her iki dosyada da kullanılan):**

#### [NEW] `utils/brand-helpers.ts`
- `getApplicationTypeBadge()`, `getApplicationTypeLabel()`, `getStatusBadgeClass()`, `getStatusLabel()` — benzerlikleri çok yüksek

---

### 1.2 `vendor/brands.vue` — 1401 satır → ~180 satır

**Yapı Analizi:**
- Satır 1–29: Info bannerları (bekleyen + belge talep)
- Satır 30–112: Header + istatistik kartları (4 KPI)
- Satır 114–350: Başvuru tablosu (timeline + belgeler + aksiyonlar)
- Satır 352–983: Başvuru sihirbazı modali (4 adım)
- Satır 987–1401: Script (tiplemeler, form mantığı, API)

**Çıkarılacak Bileşenler:**

| Bileşen | Kaynak Satırlar | Açıklama |
|---------|----------------|----------|
| `components/vendor/brands/VendorBrandStats.vue` | 30–112 | İstatistik kartları + info bannerları |
| `components/vendor/brands/VendorBrandTable.vue` | 114–350 | Başvuru tablosu (timeline) |
| `components/vendor/brands/BrandApplicationWizard.vue` | 352–983 | 4 adımlı sihirbaz modali |

**Çıkarılacak Composable:**

#### [NEW] `composables/useVendorBrands.ts`
- `fetchBrands()`, `submitApplication()`, `editBrand()`, `withdrawApplication()`, `reapplyBrand()`
- `handleLogoUpload()`, `handleDocumentUpload()`
- `canProceed` computed, wizard step mantığı

--- [x] **Faz 1: Cüzdan Sayfası (wallet.vue)** - 1233 satır -> 120 satır. ✅
- [x] **Faz 2: Stok Fazlası Modal (CreateSurplusModal.vue)** - 1138 satır -> 110 satır. ✅
- [x] **Faz 3: Stok Fazlası Pazaryeri (surplus/index.vue)** - 994 satır -> 140 satır. ✅
- [x] **Faz 4: Finansal Dashboard (ledger-dashboard.vue)** - 966 satır -> 130 satır. ✅
- [x] **Faz 4.5: Stabilizasyon & Tip Güvenliği** - Composable dosyalarındaki 52 TS hatasının temizlenmesi. ✅ (Büyük kısmı tamamlandı)
- [x] **Faz 5: Reklam Yönetimi (admin/advertising/index.vue)** - 889 satır -> 110 satır. ✅
- [x] **Faz 6: İçerik Yönetimi (content.vue)** - 961 satır -> 85 satır. ✅
- [x] **Faz 7: Marka Yönetimi (admin/brands.vue & vendor/brands.vue)** - 1700+ satır -> ~120 satır. ✅
- [x] **Faz 8: Kullanıcı ve Yetki Yönetimi (admin/users.vue & vendor/users.vue)** - ~1800 satır -> Modüler. ✅
- [x] **Faz 9: Takas Detay Yönetimi (my/surplus/swap/[id].vue)** - 949 satır -> Modüler. ✅
- [x] **Faz 10: Ana Sayfa & Vitrin Ayarları (admin/settings/homepage.vue)** - 880+ satır -> Modüler. ✅
- [x] **Faz 11: Ürün Yükleme Formu (admin/product-form.vue)** - 867 satır -> Modüler. ✅
- [x] **Faz 12: Finansal İşlemler & Cüzdan Yönetimi (admin/wallet.vue)** - 613 satır -> Modüler. ✅
- [x] **Faz 13: Ana Layout Refaktörü (layouts/default.vue)** - 1113 satır → 89 satır. `useLayoutLogic` + `LocationModal` + `VendorUpsellModal` bileşenleri oluşturuldu. ✅
- [x] **Faz 14: Admin Banner Yönetimi (pages/admin/banners.vue)** - 841 satır → ~165 satır. `useAdminBanners` + `BannerGridItem` + `BannerFormModal` bileşenleri oluşturuldu. ✅
- [x] **Faz 15: Kategori Yönetimi (pages/admin/categories/index.vue)** - 816 satır -> 125 satır. Modüler yapıya kavuşturuldu. ✅
- [x] **Faz 16: Form State & Layout Stabilizasyonu** - `ProductFormState` ve `useLayoutLogic` tipleme hataları giderildi. ✅
- [x] **Faz 17: Yardım Hesaplayıcıları (HelpCalculators.vue)** - 885 satır -> 100 satır. Modüler bileşenlere ayrıştırıldı. ✅
- [x] **Faz 18: Admin Müzayede Yönetimi (admin/auctions.vue)** - 813 satır -> 110 satır. Modülerleştirildi. ✅
- [x] **Faz 19: Yan Reklam Yönetimi (admin/settings/side-ads.vue)** - 801 satır -> 120 satır. Modülerleştirildi. ✅
- [x] **Faz 20: Üyelik Seviyeleri (VendorTierCard.vue)** - 829 satır -> 60 satır. Modülerleştirildi. ✅
- [x] **Faz 21: Satıcı Mağaza Ayarları (vendor/settings.vue)** - 775 satır -> 130 satır. `useVendorSettings` ve bölüm bileşenleri oluşturuldu. ✅

---

## Faz 2 — Cüzdan Sayfası (wallet.vue) ≈1233 satır

---

### 2.1 `wallet.vue` — 1233 satır → ~200 satır

**Yapı Analizi:**
- Satır 1–124: TicariTakas kart + bakiye overlay
- Satır 126–303: XP Hesapları + Barter Havuzu (vendor only)
- Satır 305–397: Barter topup/withdraw modalleri
- Satır 399–440: Aksiyon tabları (topup/withdraw)
- Satır 442–518: Hediye kartları bölümü
- Satır 520–595: Çekiliş kartları bölümü
- Satır 597–665: Açık artırma teklifleri bölümü
- Satır 667–800: Cüzdan hareketleri tablosu
- Satır 801–907: Yükleme + çekme talepleri tablosu
- Satır 913–1157: Script (composables, mantık)

**Çıkarılacak Bileşenler:**

| Bileşen | Kaynak Satırlar | Açıklama |
|---------|----------------|----------|
| `components/wallet/WalletBalanceCard.vue` | 42–124 | TicariTakas premium kart |
| `components/wallet/WalletXPAccounts.vue` | 126–232 | XP hesap kartları (vendor) |
| `components/wallet/WalletBarterPool.vue` | 234–303 | Barter havuz kartı + modaller |
| `components/wallet/WalletBarterModals.vue` | 305–397 | Topup + Withdraw modalleri |
| `components/wallet/WalletGiftCards.vue` | 442–518 | Hediye kartları grid |
| `components/wallet/WalletLotteryCards.vue` | 520–595 | Çekiliş kartları listesi |
| `components/wallet/WalletAuctionBids.vue` | 597–665 | Açık artırma teklif listesi |
| `components/wallet/WalletTransactions.vue` | 667–800 | İşlem geçmişi tablosu |
| `components/wallet/WalletRequests.vue` | 801–907 | Yükleme/çekme talepleri |

> [!NOTE]
> `useWallet()` composable zaten mevcut. Script kısmındaki barter topup/withdraw/register ve tier config fonksiyonlarını mevcut composable'a eklemek yeterli.

---

## Faz 3 — Fazla Mal Modülü (CreateSurplusModal + surplus/index) ≈2130 satır

---

### 3.1 `CreateSurplusModal.vue` — 1138 satır → ~200 satır

**Yapı Analizi:**
- Satır 1–25: Modal header
- Satır 27–229: Temel bilgiler section (başlık, kategori, miktar, fiyat, açıklama + fiyat danışmanı)
- Satır 231–330: Medya section (drag&drop, url, resim grid)
- Satır 332–478: Takas tercihleri (aranan kategoriler + takas modları)
- Satır 480–637: Teknik özellikler (dinamik form + özel attribute'lar)
- Satır 639–684: Submit butonu
- Satır 687–1139: Script

**Çıkarılacak Bileşenler:**

| Bileşen | Kaynak Satırlar | Açıklama |
|---------|----------------|----------|
| `components/surplus/SurplusBasicInfo.vue` | 27–229 | Başlık, kategori, miktar, fiyat, açıklama |
| `components/surplus/SurplusPriceAdvisor.vue` | 159–216 | Piyasa fiyat danışmanı widget |
| `components/surplus/SurplusMediaUpload.vue` | 231–330 | Resim yükleme ve grid |
| `components/surplus/SurplusTradePreferences.vue` | 332–478 | Aranan kategoriler + takas modları |
| `components/surplus/SurplusTechnicalSpecs.vue` | 480–637 | Dinamik teknik özellikler formu |

**Çıkarılacak Composable:**

#### [NEW] `composables/useSurplusForm.ts`
- Form state, kategori ağacı, spec yönetimi, validasyon, submit

---

### 3.2 `surplus/index.vue` — 994 satır → ~250 satır

**Yapı Analizi:**
- Satır 1–270: Ana sayfa: Hero, filtreler, ilan grid'i, pagination
- Satır 274–340: Özel fırsatlar bento grid
- Satır 344–542: Performans Vitrini (5 adet ürün listesi)
- Satır 544–625: Birlikte Al (Group Buy) section
- Satır 627–652: Barter Pool CTA
- Satır 655–995: Script

**Çıkarılacak Bileşenler:**

| Bileşen | Kaynak Satırlar | Açıklama |
|---------|----------------|----------|
| `components/surplus/SurplusItemGrid.vue` | 93–222 | İlan kartları grid + empty state |
| `components/surplus/PerformanceShowcase.vue` | 346–541 | 5 bölümlü vitrin (bestsellers, favorites vb.) |
| `components/surplus/GroupBuyBanner.vue` | 544–625 | Birlikte al immersive banner |
| `components/surplus/BarterPoolCTA.vue` | 627–652 | Barter havuz CTA kartı |

> [!TIP]
> `SurplusItemGrid` birçok sayfada tekrar kullanılabilir bir kart bileşenidir. `PerformanceShowcase` da ana sayfa için bağımsız bileşendir — diğer ecosystem'lerde (BazarX, BarterBorsa) de kullanılabilir.

---

## Faz 4 — Admin Paneli (ledger-dashboard + content + admin/ad) ≈2800 satır

---

### 4.1 `admin/ledger-dashboard.vue` — 966 satır → ~200 satır

**Yapı Analizi:**
- Satır 1–130: KPI kartları (4 adet)
- Satır 132–230: Grafik satırı (daily activity + donut + volume)
- Satır 232–328: Son ledger kayıtları tablosu
- Satır 330–497: Anomali uyarıları bölümü
- Satır 499–682: Finansal mutabakat bölümü
- Satır 685–967: Script (chart config, API, helpers)

**Çıkarılacak Bileşenler:**

| Bileşen | Kaynak Satırlar | Açıklama |
|---------|----------------|----------|
| `components/admin/ledger/LedgerKPICards.vue` | 54–130 | 4 KPI kartı |
| `components/admin/ledger/LedgerCharts.vue` | 132–230 | ApexCharts grafikleri |
| `components/admin/ledger/LedgerRecentEntries.vue` | 232–328 | Son kayıtlar tablosu |
| `components/admin/ledger/LedgerAnomalyAlerts.vue` | 330–497 | Anomali uyarı sistemi |
| `components/admin/ledger/LedgerReconciliation.vue` | 499–682 | Mutabakat analizi |

**Çıkarılacak Composable:**

#### [NEW] `composables/useAdminLedger.ts`
- Chart options/configs, fetch fonksiyonları, KPI hesaplamaları, anomali/recon mantığı

---

### 4.2 `admin/content.vue` — 960 satır → ~200 satır

**Yapı Analizi:**
- 3 tab (Duyurular, Politikalar, Dinamik İçerikler)
- 3 ayrı modal (her tab için create/edit)
- Her tab kendi tablosu + CRUD fonksiyonları

**Çıkarılacak Bileşenler:**

| Bileşen | Kaynak Satırlar | Açıklama |
|---------|----------------|----------|
| `components/admin/content/AnnouncementTab.vue` | 44–144 | Duyurular tablosu |
| `components/admin/content/AnnouncementModal.vue` | 302–475 | Duyuru formu |
| `components/admin/content/PolicyTab.vue` | 146–203 | Politika kartları |
| `components/admin/content/PolicyModal.vue` | 477–576 | Politika formu |
| `components/admin/content/DynamicContentTab.vue` | 205–299 | İçerik tablosu |
| `components/admin/content/DynamicContentModal.vue` | 578–685 | İçerik formu |

---

### 4.3 `admin/advertising/index.vue` — 889 satır → ~200 satır

> [!NOTE]
> Bu dosya vendor tarafının kardeşi. Daha önce vendor reklamı için yaptığımız pattern (StatsCards, CampaignTable, modals) burada da birebir uygulanacak.

---

## Uygulama Sırası ve Tahmini Etki

| Faz | Dosyalar | Toplam Satır | Hedef | Kazanım |
|-----|----------|-------------|-------|---------|
| **1** | admin/brands + vendor/brands | 3137 | ~380 | **2757 satır azalma** |
| **2** | wallet.vue | 1233 | ~200 | **1033 satır azalma** |
| **3** | CreateSurplusModal + surplus/index | 2132 | ~450 | **1682 satır azalma** |
| **4** | ledger-dashboard + content + admin/ad | 2815 | ~600 | **2215 satır azalma** |
| **TOPLAM** | | **9317** | **~1630** | **~7700 satır temizlik** |

---

## Verification Plan

### Her Faz Sonunda
1. `pnpm type-check` — 0 hata
2. `pnpm dev` — dev server boot döngüsüne girmeli
3. İlgili sayfalara tarayıcıdan giriş — UI kırılması olmamalı
4. `git commit` + `git push origin main`

### Genel Kurallar
- Mevcut tasarım ve CSS bozulmayacak (copy-paste, stil korunacak)
- API çağrıları hiç değişmeyecek (sadece taşınacak)
- Mevcut yorumlar ve docstring'ler korunacak
- Her yeni composable/util TypeScript ile yazılacak

---

## Open Questions

> [!IMPORTANT]
> **Hangi fazdan başlamak istersiniz?**
> - Faz 1 (Marka Yönetimi) — en büyük kazanç (~2750 satır)
> - Faz 2 (Cüzdan) — en karmaşık iş mantığı
> - Hepsini sırayla uygula

> [!WARNING]
> `surplus/index.vue` hem e-ticaret hem TicariTakas sayfalarının homepage bileşenlerini içeriyor. `PerformanceShowcase` ve `GroupBuyBanner` gibi bileşenler ana sayfa'da da kullanılıyorsa, paylaşımlı bileşen olarak tasarlanmalıdır.
