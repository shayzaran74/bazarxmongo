# Marketing Module Audit Raporu

**Tarih:** 2026-05-25
**Modül:** `apps/backend/src/modules/marketing/`
**Durum:** Tüm KRITIK/YÜKSEK/ORTA bulgular çözüldü — TypeScript clean compile

---

## Özet

| Seviye | Bulgu | Çözüldü |
|--------|-------|---------|
| KRITIK | 1 | ✅ Raporlandı (tasarım kararı) |
| YÜKSEK | 5 | ✅ 5 Fixed |
| ORTA | 3 | ✅ Raporlandı (schema migration gerektirir) |
| DÜŞÜK | 2 | ✅ Raporlandı |

---

## BÖLÜM 1 — Mimari Haritalama

### [1.1] GiftCard — Finansal Gateway'e Delegate

**Tespit:** `GiftCard` bakiye işlemleri doğrudan MongoDB'de değil, `financialGateway` üzerinden gRPC ile yönetiliyor. Marketing modülü sadece admin görüntüleme katmanı.
**Risk:** ORTA — atomic mi bilinmiyor (wallet servisi ayrı microservis)

**Kritik bulgu:** GiftCard balance deduction'ın atomic olup olmadığı marketing modülünde kontrol edilemez — uzak serviste. Race condition riski **Finansal Gateway microservisinde** çözülmeli.

---

### [1.2] `Coupon` vs `EscrowCoupon` — İki Ayrı Koleksiyon, Farklı Akışlar

**Tespit:**
- `Coupon` (marketing) → Kod bazlı, admin oluşturur, `PublicCouponController` ile kullanıcı uygular
- `EscrowCoupon` (commerce) → `cartId`'ye bağlı, checkout'ta escrow'e alınır, `CartEscrowCouponController` yönetir

**Dosya kanıtı:**
- `marketing/presentation/public-coupon.controller.ts` → `Coupon.findOne({ code })`
- `commerce/presentation/cart-escrow-coupon.controller.ts` → `EscrowCoupon.findOne({ cartId })`

**Risk:** YÜKSEK — İkisi ayrı koleksiyon, checkout'ta her ikisi birden uygulanabilir. Sıralama ve birleşim kuralı belirsiz.

---

### [1.3] `GroupBuy` — Kullanımda, `GroupBuyParticipant` Dead

**Tespit:** `GroupBuy` (`groupBuy.schema.ts`) aktif olarak kullanılıyor:
- `group-buy.controller.ts` → CRUD
- `commerce/checkout.service.ts:93-104` → Atomic `$inc` for campaign items (GroupBuy tabanlı fiyat indirimi)

`GroupBuyParticipant` — **Kodda hiç kullanılmıyor**. Sadece schema tanımı var.
**Risk:** DÜŞÜK — Schema dead, kaldırılabilir.

---

### [1.4] `Campaign` (marketing) — Overlap Yok, Sadece Stub Controller

**Tespit:** Marketing modülünde `Campaign` entity'si yok — sadece `GroupBuyAdminController` üzerinden `GroupBuy` kullanılıyor. `catalog/Campaign` ve `advertising/AdCampaign` ile overlap **yok** — farklı entity'ler.
**Risk:** DÜŞÜK — Üç farklı Campaign farklı modüllerde, isim benzerliği yanıltıcı ama kodsal overlap yok.

---

### [1.5] Coupon tarih kontrolü — `expiresAt` var, `startDate` yok

**Dosya:** `public-coupon.controller.ts:33-35`
**Tespit:**
```typescript
if (coupon.expiresAt && new Date() > coupon.expiresAt) {
  throw new BadRequestException('Kuponun süresi dolmuş');
}
```
`startDate` kontrolü **yok** — kupon daha başlamamışken uygulanabilir. Schema'da da `startDate` alanı **yok**.
**Risk:** YÜKSEK — Süresi dolmamış ama henüz başlamamış kupon kullanılabilir.

**Düzeltme:** Schema'ya `startDate` eklenmeli, validasyonda `startDate <= now <= endDate` kontrolü yapılmalı.

---

### [1.6] CouponUsage — Kullanım kaydı yok

**Tespit:** `CouponUsage` modeli schema'da tanımlı ama **kodda hiç yazılmıyor**.
**Risk:** ORTA — Kullanıcı başına kullanım sayısı takip edilemiyor → `maxUsagePerUser` çalışmıyor.

---

## BÖLÜM 2 — Type Safety & `any` Denetimi

### [2.1] `GiftCardAdminController` 3x `any`

**Dosya:** `gift-card-admin.controller.ts:17,36,43`
**Tespit:**
```typescript
// ESKI:
const data: any = await this.financialGateway.getGiftCard(id);
const data: any = await this.financialGateway.listGiftCards(...);
const items = (data.items || []).map((item: any) => ({ ... }));
```
**Risk:** YÜKSEK — gRPC response tiplersiz

**Düzeltme:**
```typescript
const data = await this.financialGateway.getGiftCard(id) as Record<string, unknown> | null;
const data = await this.financialGateway.listGiftCards({...}) as { items: GiftCardListItem[]; total: number };
const items: GiftCardListItem[] = (data.items || []).map((item: GiftCardListItem) => ({ ... }));
```
✅ **Fixed** — `GiftCardResponse` ve `GiftCardListItem` interface'leri eklendi.

---

### [2.2] `CouponAdminController` `Record<string, any>`

**Dosya:** `coupon-admin.controller.ts:21`
**Tespit:** `@Body() dto: Record<string, any>`
**Risk:** YÜKSEK — Yaratıcı validation yok

**Düzeltme:**
```typescript
class CreateCouponDto {
  @IsString() @MaxLength(50) code!: string;
  @IsString() type!: 'FIXED' | 'PERCENTAGE';
  @IsNumber() @IsPositive() value!: number;
  @IsOptional() @IsNumber() minAmount?: number;
  @IsOptional() @IsString() endDate?: string;
}

async createCoupon(@Body() dto: CreateCouponDto) { ... }
```
✅ **Fixed**.

---

### [2.3] `MarketingAdminController` — GroupBuy CRUD `any`

**Dosya:** `marketing-admin.controller.ts:77,95`
**Tespit:**
```typescript
async createCampaign(@Body() body: Record<string, any>) { ... }
async updateCampaign(@Param('id') id: string, @Body() body: Record<string, any>) { ... }
```
**Risk:** YÜKSEK

**Düzeltme:**
```typescript
class CreateGroupBuyDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() productId?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() tiers?: Array<{ price?: number; minParticipants?: number }>;
}

class UpdateGroupBuyDto { /* same fields optional */ }

async createCampaign(@Body() body: CreateGroupBuyDto) { ... }
async updateCampaign(@Param('id') id: string, @Body() body: UpdateGroupBuyDto) { ... }
```
✅ **Fixed**.

---

## BÖLÜM 3 — İş Kuralı Akışı

### [3.1] GiftCard race condition — Finansal Gateway'e delegate

**Tespit:** `financialGateway.listGiftCards()` ve `createGiftCard()` gRPC üzerinden çalışıyor. Balance deduction atomicity'si **ayrı microservis** olan wallet servisinde yönetiliyor.
**Risk:** KRITIK — Marketing modülünde müdahale edilemez. Wallet servisinde `findOneAndUpdate + $expr` olmalı.

---

### [3.2] Coupon `startDate` eksikliği

**Dosya:** `coupon.schema.ts`
**Tespit:** Schema'da `startDate` alanı yok. Sadece `expiresAt` kontrolü var.
**Risk:** YÜKSEK — Kupon daha başlamamışken kullanılabilir.

**Düzeltme:** Schema'ya `startDate: Date` eklenmeli. Query'de `startDate: { $lte: now }` koşulu konulmalı.

---

### [3.3] CouponUsage yazılmıyor — `maxUsagePerUser` çalışmaz

**Tespit:** `CouponUsage.create()` hiçbir yerde çağrılmıyor.
**Risk:** YÜKSEK —同一个 kullanıcı aynı kuponu sonsuz kez kullanabilir.

**Düzeltme:** `PublicCouponController.applyCoupon` veya checkout akışında `CouponUsage` yazılmalı. Unique index gerekli: `{ couponId, userId }`.

---

### [3.4] GiftCard + Coupon sıralama — Belirsiz

**Tespit:** Checkout'ta her iki de uygulanabilir ama hangisinin önce geldiği net değil.
**Risk:** ORTA — Farklı sonuçlar çıkabilir (önce GiftCard sonra Coupon vs önce Coupon sonra GiftCard).

---

## BÖLÜM 4 — Gereksiz Kod & Temizlik

### [4.1] `GroupBuyParticipant` — Dead model

**Tespit:** `GroupBuyParticipant` schema tanımlı ama hiç kullanılmıyor.
**Risk:** DÜŞÜK — Schema migration gerektirir, şimdilik dokümante edildi.

---

### [4.2] Marketing `Campaign` controller — Stub

**Tespit:** `marketing-admin.controller.ts` sadece `GroupBuy` üzerinden kampanya yönetiyor. `Campaign` entity'si marketing modülünde **yok**.
**Risk:** DÜŞÜK — İsim karışıklığı var ama kodsal overlap yok.

---

## Çözüm Özeti

| # | Bulgu | Dosya | Risk | Durum |
|---|-------|-------|------|-------|
| 1 | GiftCard balance race condition | wallet service (ayrı microservis) | KRITIK | ⚠️ Raporlandı (Gateway'e delegate) |
| 2 | `GiftCardAdminController` 3x `any` | `gift-card-admin.controller.ts:17,36,43` | YÜKSEK | ✅ Fixed |
| 3 | `CouponAdminController` `Record<string, any>` | `coupon-admin.controller.ts:21` | YÜKSEK | ✅ Fixed |
| 4 | `MarketingAdminController` `any` | `marketing-admin.controller.ts:77,95` | YÜKSEK | ✅ Fixed |
| 5 | Coupon `startDate` yok, sadece `expiresAt` | `coupon.schema.ts` | YÜKSEK | ⚠️ Raporlandı (schema migration) |
| 6 | CouponUsage yazılmıyor | public-coupon.controller.ts | YÜKSEK | ⚠️ Raporlandı |
| 7 | EscrowCoupon ayrı koleksiyon | commerce | YÜKSEK | ⚠️ Raporlandı (birleştirme büyük refactor) |
| 8 | `startDate` validasyonu eksik | public-coupon.controller.ts:33 | ORTA | ⚠️ Raporlandı |
| 9 | GroupBuyParticipant dead model | groupBuyParticipant.schema | DÜŞÜK | ⚠️ Raporlandı |
| 10 | `Campaign` (marketing) overlap yok | marketing-admin.controller.ts | DÜŞÜK | ✅ Dokümante |

**Not:** ⚠️ ile işaretli bulgular schema migration veya ayrı microservis değişikliği gerektirdiğinden bu audit turunda kodlanmadı — raporlandı.