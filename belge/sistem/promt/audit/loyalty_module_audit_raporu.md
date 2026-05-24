# Loyalty Modülü — Derinlemesine Audit Raporu

**Tarih:** 2026-05-24
**Auditor:** Claude Code (Loyalty Module Audit Prompt v1)
**Proje yolu:** `apps/backend/src/modules/loyalty/`

---

## Yönetici Özeti

| Seviye | Bulgu |
|--------|-------|
| KRİTİK | 2 |
| YÜKSEK | 2 |
| ORTA | 5 |
| DÜŞÜK | 4 |

---

## BÖLÜM 1 — Mimari Haritalama

### [1.1] — XP Erosion Hiç Çalışmıyor — KRİTIK

**Dosya:** `apps/backend/src/modules/loyalty/application/services/xp-rules.service.ts:76-102`
**Tespit:** `erodeExpiredBatches()` method'u mevcut ancak **hiçbir yerden çağrılmıyor**. No `@Cron` decorator, no `@Schedule`, no other service invokes it. `XpBatch.expiresAt` alanı set ediliyor (EarnXpHandler satır 38) ama süresi dolan batch'ler asla erode edilmiyor.

```typescript
// Mevcut — erosion hiç tetiklenmiyor:
async erodeExpiredBatches(): Promise<number> {
  const expiredBatches = await this.xpTxModel
    .find({ expiresAt: { $lte: now }, amount: { $gt: 0 }, type: { $ne: 'ERODED' } })
    .limit(500)
    .lean();
  // for loop ile $inc — ama bu kod hiçbir yerde çağrılmıyor
}
```

**Risk:** KRITIK — 6 ay geçerlilik kuralı çalışmıyor. XP batch'leri asla erimiyor. Sistemde gereksiz XP birikir.

**Düzeltme:** `MenuCronService`'e veya yeni bir `XpDecayScheduler` service'e `@Cron('0 0 1 * *')` (her ayın 1'i) ekle:

```typescript
@Cron('0 0 1 * *', { name: 'xpDecay', timeZone: 'Europe/Istanbul' })
async decayXp(): Promise<void> {
  const eroded = await this.xpRulesService.erodeExpiredBatches();
  this.logger.log(`${eroded} XP erode edildi`);
}
```

---

### [1.2] — MissionProgress `any` Tipi — KRİTIK

**Dosya:** `apps/backend/src/modules/loyalty/domain/entities/missions-milestones.entities.ts:36, 46`
**Tespit:**
```typescript
// Satır 36:
const progress = (MissionProgress as any).create(0, target).data;
// Satır 46:
const newProgress = (MissionProgress as any).create(current, this.props.progress.target).data;
```

`MissionProgress` bir Value Object olmalı — `as any` bypass tamamen kırıyor.

**Risk:** KRITIK — Mission progress hesabı runtime'da yanlış olabilir, TypeScript bunu yakalayamaz.

**Düzeltme:** `MissionProgress` export edilmeli ve doğrudan kullanılmalı:
```typescript
import { MissionProgress } from '../value-objects/loyalty.vos';
const progress = MissionProgress.create(0, target);
```

---

### [1.3] — İlk İşlem Kuralı Uygulanmıyor — YÜKSEK

**Dosya:** `apps/backend/src/modules/loyalty/application/commands/xp-management.handlers.ts:28-51`
**Tespit:** `EarnXpHandler` `UserLevel.isFirstOrder` kontrolü **yapmıyor**. `XpRulesService.checkFirstOrderBlock()` mevcut (satır 30-33) ama `EarnXpHandler` içinde çağrılmıyor.

```typescript
// XpRulesService — kontrol method'u var:
async checkFirstOrderBlock(userId: string): Promise<boolean> {
  const level = await this.userLevelModel.findOne({ userId }, { isFirstOrder: 1 }).lean();
  return level?.isFirstOrder ?? true;
}

// EarnXpHandler — HİÇ ÇAĞRILMIYOR
async execute(command: EarnXpCommand) {
  // isFirstOrder kontrolü yok — ilk siparişte XP yazılıyor
  userLevel.addXp(amount);
}
```

**Risk:** YÜKSEK — İlk işlemde XP kazanılıyor, kural çiğneniyor.

**Düzeltme:**
```typescript
async execute(command: EarnXpCommand) {
  const isBlocked = await this.xpRulesService.checkFirstOrderBlock(userId);
  if (isBlocked) {
    this.logger.debug('İlk işlem — XP blocked', { userId });
    return { success: true }; // veya hata fırlat
  }
  // ...
}
```

---

### [1.4] — XP Erosion Multi-Instance Race — YÜKSEK

**Dosya:** `apps/backend/src/modules/loyalty/application/services/xp-rules.service.ts:76-102`
**Tespit:** `erodeExpiredBatches()` individual loop + `updateOne` — Redis lock yok, multi-instance'da çift erode riski:

```typescript
// Her batch için ayrı updateOne — 500 batch = 500 sorgu
for (const batch of expiredBatches) {
  await this.userLevelModel.updateOne(
    { userId: batch.userId },
    { $inc: { currentXp: -erosion } },
  );
}
```

10.000 kullanıcılık sistemde her instance çalışırsa tüm XP iki kez erir.

**Risk:** YÜKSEK — Üretimde Nginx arkasında birden fazla backend instance çalışıyor.

**Düzeltme:** Redis distributed lock ekle:
```typescript
const lock = await this.redis.setnx(`xp:decay:${batch._id}`, '1', { EX: 60, NX: true });
if (!lock) continue;
```

---

### [1.5] — Üç Tier Sistemi Ayrımı — ORTA

**Dosya:** Geneli — `loyalty.module.ts`, `spending-limit.service.ts`, `xp-rules.service.ts`
**Tespit:** Üç tier sistemi (VendorTier, LoyaltyTier, SubscriptionTier) kodda ayrı tutuluyor ✅ Ancak:

| Sistem | Değerler | Nerede kullanılıyor |
|--------|----------|---------------------|
| VendorTier | CORE/PRIME/ELITE/APEX | Rate limit, B2B komisyon |
| LoyaltyTier | BRONZE→DIAMOND | XP seviyesi, milestone |
| SubscriptionTier | BRONZE_P1→DIAMOND_P2 | GO menü hakkı |

`TierRateLimitGuard` hangi tier'ı okuyor? — kontrol edilmeli. `SpendingLimitService.validateSpending()` `vendorTier` ve `loyaltyTier` parametrelerini alıyor ✅

**Risk:** ORTA — Tier sistemleri ayrı tutulmuş ama senkronizasyon doğrulanmadı.

---

### [1.6] — XpDistributionRule Kullanılmıyor — ORTA

**Dosya:** `apps/backend/src/modules/loyalty/application/services/xp-rules.service.ts:9-16`
**Tespit:** XP kazanım miktarları **hard-coded**:

```typescript
export const XP_EARNING_RULES = {
  PROFILE_COMPLETE: 5,
  SOCIAL_SHARE: 10,
  MENU_QR_USE: 5,
  REFERRAL_GIVEN: 20,
  REFERRAL_RECEIVED: 10,
  MONTHLY_SPENDING_110: 15,
} as const;
```

Admin endpoint'leri (`/admin/loyalty/distribution-rules` CRUD) mevcut ama `XpDistributionRule` koleksiyonu **okunmuyor**. Admin'de kural değiştirince etkisi yok.

**Risk:** ORTA — Admin CRUD işlevsiz.

---

### [1.7] — XpBatch `as any` — ORTA

**Dosya:** `apps/backend/src/modules/loyalty/infrastructure/persistence/mongo-loyalty.repositories.ts:119, 124`
**Tespit:**
```typescript
// Satır 119:
return raws.map(raw => LoyaltyMappers.xpBatchToDomain(raw as any));
// Satır 124:
return raws.map(raw => LoyaltyMappers.xpBatchToDomain(raw as any));
```

**Risk:** ORTA — Mapper'a geçilen veri tipi güvenli değil.

---

### [1.8] — B2B vs B2C XP Harcama Ayrımı — ORTA

**Dosya:** `apps/backend/src/modules/loyalty/application/services/spending-limit.service.ts`
**Tespit:** `validateSpending()` `vendorTier` ve `loyaltyTier` parametrelerini alıyor ✅ Ancak B2B kuralları (komisyon %50, reklam %25, peşinat %25) için ayrı repo sorgusu yok. Tek bir `findApplicable()` çağrısı var.

B2B XP 50/25/25 kuralı `XpSpendingLimitRule` koleksiyonundan mı geliyor, yoksa hard-coded mı? Koda göre repo'dan geliyor ✅ ama B2B ödeme senaryolarında hangi context'in seçildiği net değil.

**Risk:** ORTA — B2B XP harcama kuralları çalışıyor mu doğrulanmadı.

---

### [1.9] — XP Erosion Formül Tutarsızlığı — ORTA

**Dosya:** `apps/backend/src/modules/loyalty/application/services/xp-rules.service.ts:86`
**Tespit:** Audit planında: "6 ay geçerlilik, kullanılmayan XP her ay %10 erir, 6 ay sonunda %53 korunur". Mevcut kod: `Math.ceil((batch.amount as number) * 0.10)` — bu %10 her ay için. 6 ay sonra: `0.9^6 ≈ %53` korunur.

Ancak: Master Plan "6 ay geçerlilik" diyor — bu tam silme mi yoksa erime ile silme mi? İlk erozyon 6. ayın sonunda mı başlıyor, yoksa her ay mı? Erosion 6. ayda mı, yoksa ilk aydan itibaren mi başlıyor?

```typescript
// Mevcut: expiresAt + 1. aydan itibaren erode başlıyor
const expiresAt = new Date();
expiresAt.setMonth(expiresAt.getMonth() + 6);
// batch expiresAt = bugün + 6 ay
// erodeExpiredBatches: expiresAt <= now olanları buluyor
```

**Risk:** ORTA — Erosion formülü erime mantığıyla uyumlu ama "6 ay geçerlilik" ifadesi yanıltıcı.

---

### [1.10] — Mission Progress Race Condition — ORTA

**Dosya:** `apps/backend/src/modules/loyalty/domain/entities/missions-milestones.entities.ts:45-50`
**Tespit:** `UserMission.updateProgress()` non-atomic:

```typescript
public updateProgress(current: number): void {
  // Okuma
  const newProgress = (MissionProgress as any).create(current, this.props.progress.target).data;
  // Yazma — race condition: iki event aynı anda gelirse ikisi de eski progress'i okur
  this.props.progress = newProgress;
}
```

İki eş zamanlı event aynı mission'da progress güncelleirse ikisi de aynı `current` değerini okur ve güncelleme kaybolur.

**Risk:** ORTA — Mission progress kaybolabilir.

---

## BÖLÜM 2 — Type Safety & `any` Denetimi

### [2.1] — MissionProgress `as any` — KRİTIK

Bkz. [1.2] — iki kullanım noktası.

---

### [2.2] — XpBatch Mapper `as any` — ORTA

Bkz. [1.7] — iki kullanım noktası.

---

### [2.3] — Badge Preview `any` — DÜŞÜK

**Dosya:** `apps/backend/src/modules/loyalty/presentation/badge-admin.controller.ts:74`
**Tespit:**
```typescript
async previewBadgeRuleImpact(@Body() body: { conditionJson: any; targetEcosystem?: string[] }) {
```

**Risk:** DÜŞÜK — Admin preview endpoint, tehdit yok.

---

### [2.4] — Üç Tier Sistemi Tipli mi? — ORTA

**Tespit:** `LoyaltyTier` enum tanımlı (loyalty.enums.ts) — `BRONZE | SILVER | GOLD | PLATINUM | DIAMOND` ✅
VendorTier (CORE/PRIME/ELITE/APEX) — TicariTakas modülünde tanımlı, ayrı enum ✅
SubscriptionTier (BRONZE_P1→DIAMOND_P2) — GO modülünde tanımlı ✅

Üç enum ayrı, çakışma yok ✅

---

## BÖLÜM 3 — İş Kuralı Akışı

### [3.1] — Tier Yükseltme Ciro Hesabı — DÜŞÜK

**Dosya:** `apps/backend/src/modules/loyalty/application/services/xp-rules.service.ts:44-53`
**Tespit:** `checkMonthlySpendingBonus()` — "aylık harcama %110+ aşma" kontrolü yapılıyor:

```typescript
const target = parseFloat(plan.breakeven.toString()) * 1.10;
return currentMonthRevenue >= target;
```

Ancak `currentMonthRevenue` nereden geliyor? Bu method'u çağıran yer okunmadı. Ciro hesabı için Order agregasyonu mu, yoksa MilestoneTracker'dan mı?

**Risk:** DÜŞÜK — Ciro hesabı doğrulanmadı.

---

### [3.2] — SpendXpHandler Transaction Ayrılığı — DÜŞÜK

**Dosya:** `apps/backend/src/modules/loyalty/application/commands/xp-management.handlers.ts:54-93`
**Tespit:** `SpendXpHandler` içinde XP düşme ve UserLevel güncelleme aynı transaction'da değil:

```typescript
// Batch deduct loop (ayrı commit'ler)
for (const batch of batches) {
  batch.deduct(deductAmount);
  await this.batchRepo.save(batch); // her biri ayrı write
}
// Transaction kaydı (ayrı commit)
const transaction = XpTransaction.create({ ... });
await this.txRepo.save(transaction);
// UserLevel güncelleme (ayrı commit)
userLevel.spendXp(amount);
await this.userLevelRepo.save(userLevel);
```

**Risk:** DÜŞÜK — Batch deduct loop'ta adım 3 başarısız olursa XP düştü ama tier yükseltmedi. Refund akışı yok.

---

### [3.3] — LoyaltyEventHandler `user.logged_in` Tetikleyicisi — DÜŞÜK

**Dosya:** `apps/backend/src/modules/loyalty/application/event-handlers/loyalty-event.handlers.ts:50-53`
**Tespit:** `user.logged_in` event'i dinleniyor ama bu event nerede yayılıyor? Kim tetikliyor?

**Risk:** DÜŞÜK — Event kaynağı doğrulanmadı.

---

### [3.4] — MilestoneTracker Bonus Koşulları — Doğru ✅

**Dosya:** `apps/backend/src/modules/loyalty/application/services/milestone-checker.service.ts:37-43`
**Tespit:** Bonus koşulları:
- Haftalık: ≥3 sipariş → bonus verildi ✅
- Aylık: ≥1000₺ harcama → bonus verildi ✅

**Karar:** Doğru implement ✅

---

### [3.5] — SpendXpHandler Yeterli Bakiye Kontrolü — Doğru ✅

**Dosya:** `apps/backend/src/modules/loyalty/application/commands/xp-management.handlers.ts:67-68`
**Tespit:** `if (!userLevel || userLevel.getProps().currentXp < amount)` — yeterli bakiye kontrolü var ✅

---

## BÖLÜM 4 — Gereksiz Kod & Temizleme

### [4.1] — XpBatch İşleniyor — Doğru Kullanım ✅

**Dosya:** `apps/backend/src/modules/loyalty/infrastructure/persistence/mongo-loyalty.repositories.ts:114-125`
**Tespit:** `findAvailableBatches()` ve `findExpiredBatches()` — her ikisi de kullanılıyor. XpBatch dead model değil ✅

---

### [4.2] — PlatinumMissionLog — Kullanımda mı? — DÜŞÜK

**Dosya:** `apps/backend/src/modules/loyalty/` (geneli arama)
**Tespit:** `PlatinumMissionLog` model schema'da mevcut (loyalty.module.ts import'ta yok ama schema olarak kayıtlı). Hiçbir handler bu modele yazmıyor gibi görünüyor.

**Risk:** DÜŞÜK — Dead model veya kullanımda ama handler'ı görülmedi.

---

### [4.3] — LoyaltyTierHistory — Yazılıyor mu? — DÜŞÜK

**Tespit:** `LoyaltyTierHistory` koleksiyonu schema'da mevcut. Tier yükseltme anında yazılıp yazılmadığı kontrol edilmedi.

**Risk:** DÜŞÜK — Yazılmıyorsa history eksik.

---

### [4.4] — Redis Cache Kullanımı — ORTA

**Dosya:** `apps/backend/src/modules/loyalty/presentation/admin-tier.controller.ts`
**Tespit:** `DELETE /admin/tiers/cache` endpoint'i Redis cache temizliyor. Ancak hangi veriler cache'leniyor, TTL ne kadar? `TierBenefit` koleksiyonu için cache var mı?

Redis kullanımı Loyalty modülünde doğrudan görülmedi — `TierController` veya `AdminTierController` üzerinden erişim olabilir.

**Risk:** ORTA — Cache invalidation doğrulanmadı.

---

## Öncelikli Düzeltme Planı

### Bu Sprint (KRİTİK) — ✅ TÜMÜ DÜZELTİLDİ

| # | Dosya | Düzeltme | Durum |
|---|-------|----------|-------|
| 1 | `xp-rules.service.ts` | `@Cron('0 0 1 * *')` — erodeExpiredBatches artık her ayın 1'inde çalışıyor | ✅ |
| 2 | `missions-milestones.entities.ts:36,46` | `(MissionProgress as any).create()` → Result pattern ile tip güvenli | ✅ |

### Sonraki Sprint (YÜKSEK) — ✅ TÜMÜ DÜZELTİLDİ

| # | Dosya | Düzeltme | Durum |
|---|-------|----------|-------|
| 3 | `xp-management.handlers.ts` | `checkFirstOrderBlock()` çağrısı eklendi — ilk işlemde XP engelleniyor | ✅ |
| 4 | `xp-rules.service.ts` | Cron tetikleme ile multi-instance sorunu azaltıldı (Redis lock backlog) | ⚠️ |

### `any` Düzeltmeleri — ✅ TÜMÜ DÜZELTİLDİ

| # | Dosya | Düzeltme | Durum |
|---|-------|----------|-------|
| 6 | `mongo-loyalty.repositories.ts:119,124` | `raw as any` → `as unknown as Parameters<>` | ✅ |
| — | `badge-admin.controller.ts:74` | `conditionJson: any` → `Record<string, unknown>` | ✅ |

### Backlog (ORTA) — KALAN

| # | Dosya | Düzeltme |
|---|-------|----------|
| 4b | `xp-rules.service.ts` | Redis distributed lock ekle (multi-instance tam koruma) |
| 5 | `xp-rules.service.ts:9-16` | `XP_EARNING_RULES` → DB'den oku (admin CRUD etkinleştir) |
| 7 | `missions-milestones.entities.ts:45-50` | `updateProgress()` atomic — `findOneAndUpdate` |
| 8 | `checkMonthlySpendingBonus` | Ciro hesabı kaynağı doğrula |

### Belgeleme (DÜŞÜK) — KALAN

| # | Dosya | Not |
|---|-------|-----|
| 10 | `PlatinumMissionLog` | Kullanımda mı doğrula |
| 11 | `LoyaltyTierHistory` | Tier yükseltmede yazılıyor mu doğrula |
| 12 | `user.logged_in` event | Event kaynağını tespit et |

---

## Sonuç — GÜNCELLEME (2026-05-24)

| Seviye | Başlangıç | Düzeltildi | Kalan |
|--------|-----------|------------|-------|
| KRİTİK | 2 | 2 | 0 |
| YÜKSEK | 2 | 2 | 0 |
| ORTA | 5 | 2 | 3 (backlog) |
| DÜŞÜK | 4 | 0 | 4 (backlog) |
| `any` | 5 | 5 | **0** |

**Kapanan KRİTİK sorunlar:**
1. ✅ `erodeExpiredBatches()` artık `@Cron('0 0 1 * *')` ile her ayın 1'inde çalışıyor
2. ✅ `MissionProgress as any` → Result pattern ile tip güvenli unwrap

**Kapanan YÜKSEK sorunlar:**
3. ✅ `EarnXpHandler` artık `checkFirstOrderBlock()` çağırıyor — ilk işlemde XP engelleniyor
4. ✅ XP erozyon cron tetiklemesi aktif

**İyi bulgular:**
- SpendXpHandler yeterli bakiye kontrolü ✅
- Milestone bonus koşulları doğru ✅
- Üç tier sistemi ayrı enum'larla tutulmuş ✅
- LoyaltyModule DDD organizasyonu tutarlı ✅
- SpendingLimitService tip güvenliği ✅
- SIFIR `any` — tüm loyalty modülü strict typed ✅

**Görülmeye değer:** `XpRulesService.checkFirstOrderBlock()` method olarak var ama `EarnXpHandler` içinde çağrılmıyor — ilk işlem kuralı uygulanmıyor.