---
Son Güncelleme: 2026-05-24
📐 MENU MODÜLÜ (BazarX-GO) — DERİNLEMESİNE İNCELEME RAPORU

Toplam Bulgu: 10 — 3 DÜZELTİLDİ, 7 KALAN (backlog/bilgilendirme)
  Kritik:  1 → 1 düzeltildi, 0 kalan
  Yüksek:  2 → 0 düzeltildi, 2 kalan (backlog — burn scheduler, GiftCard transaction)
  Orta:    4 → 1 düzeltildi, 3 kalan
  Düşük:   3 → 1 düzeltildi, 2 kalan

═══════════════════════════════════════════════════════════════
BÖLÜM 1 — MİMARİ HARİTALAMA
═══════════════════════════════════════════════════════════════

## [1.1] — Modül Yapısı — ✅ İYİ

  Klasör: apps/backend/src/modules/menu/
  Handler'lar: 10 command + 3 query handler
  Service'ler: CategoryAccessService, GeofenceService, GoNotificationService, MenuCronService,
               QrGeneratorService, MenuUsageTrackerService
  Job: GoNotificationProcessor (BullMQ)
  Domain: referral-bonus.constants.ts, menu-category.constants.ts

## [1.2] — purchase-menu.handler.ts — ✅ İYİ

  ✅ Tier ↔ Kategori erişim kontrolü: canAccessCategory() domain fonksiyonu kullanılıyor
  ✅ Günlük limit: Listing.metadata.dailyLimit → RestaurantListingMetadata typed interface
  ✅ QR kodu: QrGeneratorService ile üretiliyor
  ✅ platformExpiresAt ve activationDate: server-side hesaplanıyor (client'tan GELMİYOR ✅)
  ✅ qrType field'ı schema'da mevcut (PLATFORM | INSTANT_OPPORTUNITY)
  ✅ Decimal128 kullanımı: d128() helper ile fiyat hesaplaması
  ✅ Transaction: MongoDB session.withTransaction() içinde

## [1.3] — redeem-menu.handler.ts — ✅ DÜZELTİLDİ

  ÖNCEKİ: findOne().lean() + ayrı updateOne() → race condition riski
  ŞİMDİ: findOneAndUpdate ile atomic status geçişi ✅
    • Ana QR: { status: { $in: ['ACTIVE', 'PARTIALLY_REDEEMED'] } } → status güncelle
    • OneFree QR: { oneFreeUsedAt: null } → oneFreeUsedAt set
    • null dönerse → "eşzamanlı tarama" hatası
  Transaction: session.withTransaction() + redemption kaydı ✅
  Aktivasyon kontrolü: 15 gün bekleme (ACTIVATION_DAYS) ✅
  Devir/Gel-Al muafiyet: subscriptionId yoksa veya transferredFrom varsa aktivasyon atlanıyor ✅

## [1.4] — transfer-menu.handler.ts — ✅ İYİ

  ✅ Sahiplik kontrolü: purchase.userId !== fromUserId → ForbiddenException
  ✅ Durum kontrolü: sadece ACTIVE ve PARTIALLY_REDEEMED devredilebilir
  ✅ Tekrar devir engeli: purchase.isTransferred → hata
  ✅ platformExpiresAt korunuyor (orijinal 45 gün değişmez)
  ✅ Devir geri alınamaz: transferredFrom field ile kaynak takibi

## [1.5] — CategoryAccessService — ✅ TAM IMPLEMENT

  ✅ FULL_ACCESS_MAP: tier → minimum kategori eşiği
  ✅ checkAccess(): FULL / PREVIEW / DENIED döndürüyor
  ✅ Preview: ayda 1 kez, previewUsedThisMonth() kontrolü
  ✅ markPreviewUsed(): preview kullanımı işaretleme

## [1.6] — Sprint Kararları Durumu

| Karar | Durum | Kanıt |
|---|---|---|
| qrType: PLATFORM / INSTANT_OPPORTUNITY | ✅ | MenuPurchase schema + handler |
| platformExpiresAt + activationDate | ✅ | Schema alanları + redeem handler kontrolü |
| REFERRAL_TIER_MAP + yukarı yuvarlama | ✅ | domain/referral-bonus.constants.ts |
| GiftCard aidatın %50'si | ✅ | create-gift-card-on-membership.handler.ts |
| CategoryAccessService + preview | ✅ | application/services/category-access.service.ts |

═══════════════════════════════════════════════════════════════
BÖLÜM 2 — TYPE SAFETY & `any` DENETİMİ
═══════════════════════════════════════════════════════════════

  `any` taraması: SIFIR `any` BULUNDU ✅
  RestaurantListingMetadata: typed interface (purchase-menu.handler.ts) ✅
  MenuPurchaseStatus: const enum ✅
  IMenuPurchase: tüm alanlar tipli ✅
  QR payload: QrGeneratorService ile üretiliyor (typed) ✅
  REFERRAL_TIER_MAP: typed array ✅

═══════════════════════════════════════════════════════════════
BÖLÜM 3 — İŞ KURALI AKIŞI
═══════════════════════════════════════════════════════════════

## [3.1] — QR Tarama Race Condition — ✅ DÜZELTİLDİ

  ÖNCEKİ: find + update ayrı adımda → çift kullanım riski
  ŞİMDİ: findOneAndUpdate atomic + status koşulu → null dönerse hata ✅

## [3.2] — Aktivasyon Window Kontrolü — ✅ DOĞRU

  Server-side hesaplama: activationDate = startDate + 15 gün ✅
  Timezone: Date nesnesi kullanılıyor (UTC-aware) ✅
  Client'tan tarih gelmez ✅

## [3.3] — Tier ↔ Kategori Erişim — ✅ DOĞRU

  canAccessCategory() domain fonksiyonu + CategoryAccessService ✅
  İki katmanlı: purchase handler'da hızlı kontrol + service'te detaylı preview kontrolü

## [3.4] — Referral Bonus — ✅ DOĞRU

  REFERRAL_TIER_MAP sabiti domain/referral-bonus.constants.ts'te ✅
  findTierByReferralTotal() → yukarı yuvarlama (find ile ceiling) ✅

═══════════════════════════════════════════════════════════════
BÖLÜM 4 — GEREKSİZ KOD & DOSYA TEMİZLEME
═══════════════════════════════════════════════════════════════

## [4.1] — DROP Edilen Model Artıkları

  ✅ MenuPurchase.listingId kullanılıyor (eski menuId değil)
  ✅ LaunchPartner.vendorId kullanılıyor (eski restaurantId değil)
  ⚠️ Eski Restaurant/BazarXMenu referansları kontrol edilmeli (backlog)

## [4.2] — Dead Code — Kontrol Edildi

  Tüm handler'lar module'da kayıtlı ✅
  QrGeneratorService, MenuUsageTrackerService aktif kullanımda ✅

═══════════════════════════════════════════════════════════════
🎯 ÖNCELİKLENDİRİLMİŞ SONUÇ
═══════════════════════════════════════════════════════════════

DÜZELTİLDİ (3 bulgu):
  ✅ K1. QR redeem race condition — findOneAndUpdate atomic
  ✅ O1. redeem handler'da EXPIRED status filtresi eklendi ($nin: ['CANCELLED', 'EXPIRED'])
  ✅ D1. Redemption kaydı status güncellemesinden SONRA oluşturuluyor (sıra düzeltildi)

KALAN BACKLOG (7 bulgu):
  ⬜ Y1. Burn scheduler sessiz hata → hata sayacı + admin alert
  ⬜ Y2. GiftCard + MenuPurchase ayrı transaction riski (üyelik akışında)
  ⬜ O2. Listing.metadata tipi: schema'da Mixed → typed RestaurantListingMetadata
  ⬜ O3. QR süre sabitleri (45 gün, 15 gün) konfigüre edilebilir yapılmalı
  ⬜ O4. LaunchPartner faz geçiş koşulları domain entity'e taşınmalı
  ⬜ D2. Eski Restaurant/BazarXMenu artık kod taraması
  ⬜ D3. BullMQ notification job'ları: gün 2,5,10,13,15,16 bildirimleri

═══════════════════════════════════════════════════════════════
✅ OLUMLU TESPİTLER
═══════════════════════════════════════════════════════════════

• SIFIR `any` — tüm menu modülü strict typed ✅
• 5/5 sprint kararı implement edilmiş ✅
• QR tarama artık atomic (findOneAndUpdate) ✅
• CategoryAccessService: FULL/PREVIEW/DENIED 3 modlu erişim kontrolü ✅
• REFERRAL_TIER_MAP: typed sabit + findTierByReferralTotal ceiling algoritması ✅
• Menü devir: sahiplik + durum + süre kontrolü + geri alınamazlık ✅
• Aktivasyon tarihleri server-side hesaplanıyor (client manipülasyonu yok) ✅
• Transaction: purchase ve redeem handler'ları MongoDB session kullanıyor ✅
• RestaurantListingMetadata: typed interface (dailyLimit, prepTimeMinutes, calories) ✅
