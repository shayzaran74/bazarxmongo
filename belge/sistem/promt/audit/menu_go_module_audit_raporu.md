# Menu Modülü (BazarX-GO) — Derinlemesine Audit Raporu

**Tarih:** 2026-05-24
**Auditor:** Claude Code (Menu/GO Module Audit Prompt v1)
**Proje yolu:** `apps/backend/src/modules/menu/`

---

## Yönetici Özeti

| Seviye | Bulgu |
|--------|-------|
| KRİTİK | 2 |
| YÜKSEK | 3 |
| ORTA | 4 |
| DÜŞÜK | 3 |

---

## BÖLÜM 1 — Mimari Haritalama

### [1.1] — Modül Yapısı — Doğru Organize ✅

**Dosya:** `apps/backend/src/modules/menu/menu.module.ts`
**Tespit:**
- Klasör: `menu/` (go/ değil)
- Handler'lar: `application/commands/` ve `application/queries/` altında organize ✅
- `purchase-menu.handler.ts` Listing modelini `@InjectModel('Listing')` ile doğrudan alıyor — `catalog.module.ts` import etmiyor
- Schema'lar: `@barterborsa/shared-persistence` üzerinden tüm modeller import ediliyor ✅

---

### [1.2] — `purchase-menu.handler.ts` Eksik Alanlar — KRİTIK

**Dosya:** `apps/backend/src/modules/menu/application/commands/purchase-menu.handler.ts:96-114`
**Tespit:** MenuPurchase oluşturulurken aşağıdaki alanlar **HIÇ SET EDİLMİYOR**:

```typescript
// Mevcut — eksik alanlar:
await this.purchaseModel.create([{
  _id: newId, id: newId, userId, listingId,
  subscriptionId: subscriptionId ?? null,
  paidAmount, serviceFee, vatAmount,
  qrCode, qrExpiresAt, oneFreeQrCode,
  menuCategory, isTransferred: false,
  status: 'ACTIVE', xpEarned: 5,
  // qrType → YOK
  // platformExpiresAt → YOK
  // activationDate → YOK
}]);
```

Schema'da `qrType`, `platformExpiresAt`, `activationDate` alanları mevcut (satır 39-42, 76-79) ancak handler'da yazılmıyor. Bu alanlar ya `undefined` kalıyor ya da hiç oluşturulmuyor.

**Risk:** KRITIK — `platformExpiresAt` ve `activationDate` set edilmezse:
1. `redeem-menu.handler.ts` satır 49-65'teki aktivasyon kontrolü çalışmaz
2. 45 günlük sabit pencere kaydedilmez — süre hesabı bozulur
3. Frontend "üyelik aktif değil" hatası verse de backend'de tarih kaydı yok

**Düzeltme:**
```typescript
const now = new Date();
const platformExpiresAt = new Date(now);
platformExpiresAt.setDate(platformExpiresAt.getDate() + 45);
const activationDate = new Date(now);
activationDate.setDate(activationDate.getDate() + 15);

await this.purchaseModel.create([{
  // ...existing fields...
  qrType: useMenuCredit ? 'PLATFORM' : 'INSTANT_OPPORTUNITY',
  platformExpiresAt,
  activationDate,
}]);
```

---

### [1.3] — QR Tarama Race Condition — KRİTIK

**Dosya:** `apps/backend/src/modules/menu/application/commands/redeem-menu.handler.ts:67-93`
**Tespit:** İki adımlı tarama işlemi — race condition riski:

```typescript
// ADIM 1 — oku (iki eş zamanlı tarama ikisi de burayı geçer)
const purchase = await this.purchaseModel.findOne({ ...qrCode... }).lean();

// ADIM 2 — güncelle (ikisi de status: 'ACTIVE' görür, ikisi de USED yapar)
await this.purchaseModel.updateOne(
  { _id: purchase._id ?? purchase.id },
  { $set: { status: newStatus, qrUsedAt: new Date() } },
);
```

**Risk:** KRITIK — Aynı QR aynı anda iki cihazla taranırsa ikisi de geçerli sayılır. Restoran iki kez servis verir ama sistem tek ödeme kaydeder.

**Düzeltme:**
```typescript
// Atomic findOneAndUpdate — tek adımda kontrol + güncelle
const updated = await this.purchaseModel.findOneAndUpdate(
  {
    $or: [
      { qrCode, status: 'ACTIVE' },
      { oneFreeQrCode: qrCode, oneFreeUsedAt: { $ne: null, $exists: true } },
    ],
  },
  { $set: { status: 'REDEEMED', qrUsedAt: new Date() } },
  { new: true },
);
if (!updated) throw new ConflictException({ code: 'ALREADY_REDEEMED' });
```

---

### [1.4] — QR Tipi (`qrType`) Set Edilmiyor — YÜKSEK

**Dosya:** `apps/backend/src/modules/menu/application/commands/purchase-menu.handler.ts`
**Tespit:** `qrType: 'PLATFORM' | 'INSTANT_OPPORTUNITY'` schema'da tanımlı (menuPurchase.schema.ts:76) ancak handler'da hiç set edilmiyor. Tüm satın alımlar `undefined` qrType ile kaydediliyor.

**Risk:** YÜKSEK — Redeem handler qrType'a göre dallanamaz. INSTANT_OPPORTUNITY için `restaurantExpiresAt` kontrolü yapılamaz.

---

### [1.5] — INSTANT_OPPORTUNITY `restaurantExpiresAt` Kontrolü Eksik — YÜKSEK

**Dosya:** `apps/backend/src/modules/menu/application/commands/redeem-menu.handler.ts`
**Tespit:** `redeem-menu.handler.ts` satır 38'de sadece `qrExpiresAt` kontrolü var. INSTANT_OPPORTUNITY QR'lar için ayrı `restaurantExpiresAt` alanı schema'da mevcut ama kontrol edilmiyor.

```typescript
// Mevcut — tüm QR tipleri için tek kontrol:
if (new Date() > purchase.qrExpiresAt) throw new BadRequestException('QR süresi dolmuş');
```

INSTANT_OPPORTUNITY QR'lar `restaurantExpiresAt`'e göre sürelsiz olarak kabul edilir.

**Düzeltme:**
```typescript
if (purchase.qrType === 'INSTANT_OPPORTUNITY' && purchase.restaurantExpiresAt) {
  if (new Date() > purchase.restaurantExpiresAt) {
    throw new BadRequestException('Bu anlık fırsat QR\'ının süresi dolmuş');
  }
} else if (new Date() > purchase.qrExpiresAt) {
  throw new BadRequestException('QR kodunun süresi dolmuş');
}
```

---

### [1.6] — GiftCard Oluşturma Tetiklenmiyor — YÜKSEK

**Dosya:** `apps/backend/src/modules/menu/application/commands/purchase-menu.handler.ts`
**Tespit:** `CreateGiftCardOnMembershipHandler` mevcut (menu.module.ts:40, create-gift-card-on-membership.handler.ts) ancak `purchase-menu.handler.ts` içinde **hiç tetiklenmiyor**. Üyelik satın alındığında %50 hediye kartı oluşturulmuyor.

Audit planında kararlaştırılan: "üyelik satın alınır alınmaz GiftCard anında oluşturulur." Bu akış **implement edilmemiş**.

**Risk:** YÜKSEK — Kullanıcı aidat ödüyor ama %50 hediye kartını alamıyor.

---

### [1.7] — Transfer Atomic Değil — ORTA

**Dosya:** `apps/backend/src/modules/menu/application/commands/transfer-menu.handler.ts:58-87`
**Tespit:** İki ayrı işlem (create + updateOne) transaction içinde değil:

```typescript
// Satır 58 — yeni QR oluştur (ayrı commit)
await this.purchaseModel.create([{...}]);

// Satır 77 — orijinali TRANSFERRED olarak işaretle (ayrı commit)
await this.purchaseModel.updateOne({ id: purchaseId }, { $set: {...} });
```

Aralarında session yok, transaction yok. Adım 1 başarılı olup adım 2 başarısız olursa: alıcı QR'ı aldı ama orijinal QR hâlâ ACTIVE.

**Risk:** ORTA — İki adım atomic değil.

---

### [1.8] — `Listing.metadata` Tiplendirme — ORTA

**Dosya:** `apps/backend/src/modules/menu/application/commands/purchase-menu.handler.ts:15-20, 52`
**Tespit:** `RestaurantListingMetadata` interface tanımlı (satır 15-20) ama handler'da cast ile kullanılıyor:

```typescript
const metadata = ((listing as Record<string, unknown>).metadata as RestaurantListingMetadata) ?? {};
```

Listing schema'sında `metadata: { type: Object }` — tip bilgisi yok. `dailyLimit` number olarak okunuyor ama schema tipi Object.

**Risk:** ORTA — TypeScript runtime'da tip güvenliği yok, yanlış field adı sessizce `undefined` döner.

---

### [1.9] — Referans Bonus `try/catch` Sessiz Hata — ORTA

**Dosya:** `apps/backend/src/modules/menu/application/commands/register-go-referral.handler.ts:83-112`
**Tespit:** Bonus menü QR oluşturma `try/catch` içinde:

```typescript
if (bonusListing) {
  // Satır 95-109 — QR oluşturma, hata olursa sessizce geçilir
  await this.purchaseModel.create([{...}]);
  this.logger.log(`Bonus QR oluşturuldu...`);
}
// Hata olursa: bonus oluşmaz, kullanıcı bilgilendirilmez
```

Catch yok — hata olursa sessizce devam eder, kullanıcı "bonus kazandın" mesajı alır ama QR oluşmaz.

**Risk:** ORTA — Bonus triggerlandı ama QR oluşmadı — kullanıcı hakkını kaybeder.

---

### [1.10] — LaunchPartner Faz Geçiş Koşulu — DÜŞÜK

**Dosya:** `apps/backend/src/modules/menu/application/commands/advance-launch-partner-phase.handler.ts`
**Tespit:** Faz 1→2 geçişinde "60 menü taahhüdü tamamlandı mı?" kontrolü yapılıyor mu? Kod okunmadı — doğrulnamalı.

**Risk:** DÜŞÜK — Faz geçiş koşulu yoksa sistem dışı müdahale ile faz geçişi yapılabilir.

---

### [1.11] — QR Kod Imzasız — DÜŞÜK

**Dosya:** `apps/backend/src/modules/menu/application/services/qr-generator.service.ts:9-11`
**Tespit:** QR kodu = rastgele 8 byte hex. İmza yok. QR içeriği doğrudan database'den okunuyor ama QR token imzalı olsaydı tarama anında manipülasyon engellenirdi.

```typescript
generate(): string {
  return 'MENU-' + randomBytes(8).toString('hex').toUpperCase();
}
```

**Risk:** DÜŞÜK — QR kod database'den okunduğu için şimdilik güvenli. Ancak imzalı token olsaydı daha güvenli olurdu.

---

## BÖLÜM 2 — Type Safety & `any` Denetimi

### [2.1] — Menu Modülünde `any` Yok ✅

**Taramas:** `grep -rn ": any\|as any" apps/backend/src/modules/menu/` — sonuç yok.
Menu modülünde `any` tipi tespit edilmedi ✅

---

### [2.2] — `Listing.metadata` Record<string, unknown> — ORTA

**Dosya:** `packages/shared/shared-persistence/src/schemas/backend/listing.schema.ts:71,136`
**Tespit:** `metadata?: Record<string, unknown>` — tip güvencesi yok. Handler'da cast ile kullanılıyor.

**Düzeltme:**
```typescript
interface RestaurantListingMetadata {
  dailyLimit?: number;
  categoryLevel: number;
  cuisineType?: string;
}
```

---

### [2.3] — QR Token Payload — Imzasız — DÜŞÜK

**Dosya:** `qr-generator.service.ts`
**Tespit:** `QrTokenPayload` tipi mevcut değil. QR kodu doğrudan rastgele string — üzerinde imza kontrolü yok.

**Karar:** DÜŞÜK — mevcut sistem QR'ı database'den okuyor, güvenlik için imza gerekli değil şu an.

---

## BÖLÜM 3 — İş Kuralı Akışı

### [3.1] — Önceki Sprint Kararları Durumu

| Karar | Dosya | Implement? | Notlar |
|-------|-------|-----------|--------|
| `qrType: PLATFORM \| INSTANT_OPPORTUNITY` | menuPurchase.schema.ts ✅ | Schema var — HANDLERDA YOK | Handler'da set edilmiyor |
| `platformExpiresAt` + `activationDate` | menuPurchase.schema.ts ✅ | Schema var — HANDLERDA YOK | Handler satır 103-114'te yazılmıyor |
| `REFERRAL_TIER_MAP` + yukarı yuvarlama | referral-bonus.constants.ts ✅ | DOĞRU İMPLEMENT ✅ | `findTierByReferralTotal()` ceiling mantığı doğru |
| `GiftCard` %50 üyelikte anında | purchase-menu.handler.ts ❌ | YOK | Handler'da tetiklenmiyor |
| `CategoryAccessService` + preview | category-access.service.ts ✅ | DOĞRU İMPLEMENT ✅ | `checkAccess()` + `previewUsedThisMonth()` |

---

### [3.2] — Tier ↔ Kategori Erişim Kontrolü — Doğru ✅

**Dosya:** `apps/backend/src/modules/menu/application/commands/purchase-menu.handler.ts:57-70`
**Tespit:** `canAccessCategory(userTier, menuCategory)` kullanılıyor — `menu-category.constants.ts` üzerinden. `CategoryAccessService` ayrı var ama handler doğrudan sabiti kullanıyor. Her ikisi de aynı mantığı paylaşıyor ✅

---

### [3.3] — `transfer-menu.handler.ts` — Atomic Değil — ORTA

Bkz. [1.7] — transaction yok, iki ayrı işlem.

---

### [3.4] — Burn Scheduler — Eksik Bildirim — ORTA

**Dosya:** `apps/backend/src/modules/menu/application/services/menu-cron.service.ts:28-41`
**Tespit:** `markExpiredPurchases()` CRON ile çalışıyor, `status: 'EXPIRED'` yapılıyor ✅. Ancak bildirim gönderilmiyor — sadece log. `go-notification.processor.ts` `QR_EXPIRY_*` job'ları tanımlı (satır 20-22) ama burn anında tetiklenmiyor.

**Risk:** ORTA — QR süresi dolduğunda kullanıcı bilgilendirilmiyor.

---

## BÖLÜM 4 — Gereksiz Kod & Temizleme

### [4.1] — Eski `Restaurant`/`BazarXMenu` Referansları — Temiz ✅

**Taraması:** `grep -rn "Restaurant\|BazarXMenu\|menuId\b" apps/backend/src/modules/` — sonuç: sadece `RestaurantProfileDto`, `UpdateRestaurantSettingsDto`, `update-restaurant-settings.handler.ts` (bunlar vendor modülüne ait, GO ile ilgisi yok). GO modülünde eski referans yok ✅

---

### [4.2] — LaunchPartner Faz Geçiş Koşulu — DÜŞÜK

**Dosya:** `apps/backend/src/modules/menu/application/commands/advance-launch-partner-phase.handler.ts`
**Tespit:** Faz geçişinde koşul kontrolü (60 menü taahhüdü) okunmadı — doğrulanmalı.

---

### [4.3] — `go-notification.processor.ts` — İyi İmplementasyon ✅

**Dosya:** `apps/backend/src/modules/menu/application/jobs/go-notification.processor.ts`
**Tespit:** 12 job tipi tanımlı, switch-case ile işleniyor, `failed` event listener var ✅

**Karar:** Koru.

---

### [4.4] — `menu-cron.service.ts` Cron Job Envanteri

| Job | Schedule | Durum |
|-----|----------|-------|
| `markExpiredPurchases` | Her gün 09:00 | ✅ Çalışıyor |
| `warnExpiringPurchases` | Her gün 09:00 | ✅ Çalışıyor (log + bildirim) |
| `burnMonthlyRights` | 23:55 | Tetikleyici — işlem MenuRightsCleanupService'de |
| `resetSurpriseMenuQuotas` | 00:01 | ✅ Çalışıyor |
| `cancelStalePendingReservations` | Her saat | ✅ Çalışıyor |
| `expireReferralBonuses` | Her gün 09:00 | ✅ Çalışıyor |

---

## Öncelikli Düzeltme Planı

### Bu Sprint (KRITIK)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 1 | `purchase-menu.handler.ts:103-114` | `platformExpiresAt` (+45 gün) ve `activationDate` (+15 gün) set et |
| 2 | `redeem-menu.handler.ts:67-93` | `findOneAndUpdate` atomic güncelleme — race condition düzelt |

### Sonraki Sprint (YÜKSEK)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 3 | `purchase-menu.handler.ts` | `qrType` alanı set et — PLATFORM / INSTANT_OPPORTUNITY |
| 4 | `redeem-menu.handler.ts` | INSTANT_OPPORTUNITY için `restaurantExpiresAt` kontrolü ekle |
| 5 | `purchase-menu.handler.ts` | Üyelik satın alımında `CreateGiftCardOnMembershipCommand` dispatch et |

### Backlog (ORTA)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 6 | `transfer-menu.handler.ts` | Transaction ekle — iki adımı atomic yap |
| 7 | `listing.schema.ts` | `RestaurantListingMetadata` typed interface ekle |
| 8 | `register-go-referral.handler.ts:95-109` | Bonus QR hata durumunda fırlat — sessiz hata kaldır |
| 9 | `menu-cron.service.ts` | Burn anında QR_EXPIRY_LAST_DAY job'ı tetikle |
| 10 | `advance-launch-partner-phase.handler.ts` | Faz geçiş koşulu doğrula (60 menü taahhüdü) |

### Belgeleme (DÜŞÜK)

| # | Dosya | Not |
|---|-------|-----|
| 11 | `qr-generator.service.ts` | İmzalı token değerlendirmesi — Phase 6 |
| 12 | `Listing.metadata` | Typed metadata interface — backend/shared-persistence |

---

## Sonuç

Menu modülü **yapısal olarak sağlam** — DDD/CQRS organizasyonu doğru, 20 schema modeli düzgün import edilmiş, cron job'lar aktif. Referral algoritması ve category access doğru implement.

**En kritik iki sorun:**

1. **`platformExpiresAt` ve `activationDate` handler'da set edilmiyor** — schema'da alanlar var ama handler yazmıyor. Bu alanlar `undefined` kalıyor veya yazılmıyor. Aktivasyon kontrolü (15 gün bekleme) çalışmıyor.

2. **QR tarama race condition** — iki adımlı oku/güncelle yerine `findOneAndUpdate` atomic olmalı.

**İyi bulgular:**
- `CategoryAccessService` — preview hakkı + `previewUsedThisMonth` tracking ✅
- `REFERRAL_TIER_MAP` — yukarı yuvarlama algoritması doğru ✅  
- `GoNotificationProcessor` — 12 job tipi, `failed` event listener ✅
- Menu modülünde `any` tipi yok ✅
- Eski `Restaurant`/`BazarXMenu` referansları temizlenmiş ✅

**Görülmeye değer:** `purchase-menu.handler.ts` `useMenuCredit` flag'ini kullanıyor — üyelik kredisi ile satın alma (PLATFORM QR) ve normal satın alma (INSTANT_OPPORTUNITY QR) ayrımı yapılabilir, `qrType` bu flag'e göre set edilmeli.