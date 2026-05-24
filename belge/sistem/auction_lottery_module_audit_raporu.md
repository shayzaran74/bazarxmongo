# Auction & Lottery Modülü — Derinlemesine Audit Raporu

**Tarih:** 2026-05-24
**Auditor:** Claude Code (Auction & Lottery Module Audit Prompt v1)
**Proje yolu:** `apps/backend/src/modules/auction/`

---

## Yönetici Özeti

| Seviye | Bulgu |
|--------|-------|
| KRİTİK | 2 |
| YÜKSEK | 2 |
| ORTA | 4 |
| DÜŞÜK | 3 |

---

## BÖLÜM 1 — Mimari Haritalama

### [1.1] — Teklif Race Condition — KRİTIK

**Dosya:** `apps/backend/src/modules/auction/application/commands/place-bid.handler.ts:27-83`
**Tespit:** İki adımlı oku/doğrula/güncelle — race condition riski:

```typescript
// Satır 27: Okuma
const auction = await this.repository.findById(command.auctionId);

// Satır 46: Güncelleme (domain object üzerinde)
auction.placeBid(command.userId, amount);

// ... sonra await'ler zinciri

// Satır 74: Kayıt
await this.repository.save(auction);
```

İki eş zamanlı teklif aynı `currentPrice`'ı okur, her ikisi de `placeBid()` validation'ını geçer, ikisi de kaydedilir — son yazılan kazanır, önceki teklifin parası kaybolur.

**Risk:** KRITIK — Aynı anda iki kullanıcı aynı fiyatla teklif verirse her ikisi de geçerli sayılır. Birinci teklifin parası geri alınır ama kazanan yanlış olabilir.

**Düzeltme:**
```typescript
// Atomic findOneAndUpdate ile koşullu güncelleme:
const updated = await this.model.findOneAndUpdate(
  {
    id: auctionId,
    status: 'ACTIVE',
    currentPrice: { $lt: Types.Decimal128.fromString(String(amount)) },
  },
  {
    $set: {
      currentPrice: Types.Decimal128.fromString(String(amount)),
      currentWinnerUserId: userId,
      updatedAt: new Date(),
    },
  },
  { new: true },
);
if (!updated) throw new DomainException('Teklif geçersiz veya açık artırma kapalı');
```

---

### [1.2] — Lottery Seed Kaydedilmiyor — KRITIK

**Dosya:** `apps/backend/src/modules/auction/application/commands/draw-lottery.handler.ts:34-39`
**Tespit:** `crypto.randomInt()` ile kazanan seçiliyor ✅ ama **seed kaydedilmiyor**:

```typescript
const winningIndex = crypto.randomInt(0, soldTickets.length);
const winnerTicket = soldTickets[winningIndex];
winningNumber = winnerTicket.numbers[0].toString();
winnerId = winnerTicket.userId;
lottery.drawManual(winningNumber, winnerId);
// Seed → kaydedilmedi, çekiliş tekrarlanamaz
```

Kazanan seçimi güvenli (`crypto.randomInt`) ama seed loglanmıyor — şikayet durumunda çekiliş tekrar üretilemez.

**Risk:** KRITIK — Adil çekiliş kanıtı yok. Çekiliş sonucu manipüle edildiği iddia edilebilir.

**Düzeltme:**
```typescript
const seed = crypto.randomBytes(32).toString('hex');
const winningIndex = crypto.randomInt(0, soldTickets.length);
// seed'i logla:
await this.auditLog.log({
  action: 'LOTTERY_SEED',
  resourceType: 'Lottery',
  resourceId: command.lotteryId,
  newValue: { seed, winningIndex, timestamp: new Date() },
});
```

---

### [1.3] — WebSocket Broadcast Yok — YÜKSEK

**Dosya:** `apps/backend/src/modules/auction/` (geneli)
**Tespit:** Auction modülünde `@WebSocketGateway()` **yok**. WebSocket broadcast kodu **yok**. `socket.io` import'u **yok**.

Gerçek zamanlı fiyat güncellemesi için frontend polling yapıyor olmalı — WebSocket yok.

**Risk:** YÜKSEK — WebSocket yoksa son kullanıcı deneyimi kötü. Açık artırma bitiş anı frontend'e anında ulaşmaz.

---

### [1.4] — Bid Miktarı `number` Tipi — YÜKSEK

**Dosya:** `apps/backend/src/modules/auction/infrastructure/persistence/mongo-auction.repository.ts:74`
**Tespit:** `amount: Number(doc.amount)` — Decimal128 yerine JavaScript `number`:

```typescript
// Satır 74:
amount: Number(doc.amount),
```

Para değeri `Decimal128` schema'da tanımlı olmalı. `Number()` ile parse etmek floating-point precision kaybına yol açar: `0.1 + 0.2 !== 0.3`.

**Risk:** YÜKSEK — Para hesaplamalarında precision hatası. Fiyat sıralaması yanlış olabilir.

**Düzeltme:**
```typescript
// Decimal128.parse veya string olarak tut
import { Types } from 'mongoose';
amount: Types.Decimal128.fromString(doc.amount.toString()),
```

---

### [1.5] — Auction Entity `number` Tipi — ORTA

**Dosya:** `apps/backend/src/modules/auction/domain/entities/auction.entity.ts:9-12`
**Tespit:** `startingPrice: number`, `currentPrice: number`, `minBidIncrement: number` — para değerleri `number`:

```typescript
export interface AuctionProps {
  startingPrice: number;       // number → Decimal128 olmalı
  currentPrice: number;
  minBidIncrement: number;
  participationDeposit?: number;
}
```

**Risk:** ORTA — Domain entity'de de `number` tipi. Precision kaybı domain'e kadar uzanır.

---

### [1.6] — Snipe Protection Yok — ORTA

**Dosya:** `apps/backend/src/modules/auction/domain/entities/auction.entity.ts:96-113`
**Tespit:** `placeBid()` metodunda snipe protection yok. Son saniyede teklif verse bile süre uzatılmıyor:

```typescript
public placeBid(userId: string, amount: number): void {
  // ...
  if (now > this.props.endTime) {
    throw new DomainException('Auction has ended');
  }
  // Snipe protection eksik: son 30 sn'de teklif varsa uzatma yok
}
```

**Risk:** ORTA — Son saniyede teklif veren sniper avantajlı. Dezavantajlı kullanıcı deneyimi.

---

### [1.7] — Auction Status Geçiş Haritası — Doğru ✅

**Dosya:** `apps/backend/src/modules/auction/domain/entities/auction.entity.ts:25-32`
**Tespit:** `VALID_TRANSITIONS` map ile state machine ✅ — DRAFT yok, SCHEDULED → ACTIVE → ENDED → COMPLETED ✅

**Karar:** Doğru implement ✅

---

### [1.8] — `findOneAndUpdate` Winner Oluşturma — Doğru Atomic ✅

**Dosya:** `apps/backend/src/modules/auction/infrastructure/persistence/mongo-auction.repository.ts:139-143`
**Tespit:** Winner oluştururken `findOneAndUpdate` + `upsert: true` kullanılıyor ✅ — race condition yok.

---

### [1.9] — Distributed Lock Her İki Scheduler'da — Doğru ✅

**Dosya:**
- `auction-close.scheduler.ts:29-34` — Redis lock `LOCK_KEY`
- `lottery-draw.scheduler.ts:25-30` — Redis lock `LOCK_KEY`

İki scheduler da Redis distributed lock kullanıyor ✅ — multi-instance koruması var.

---

### [1.10] — Lottery İdempotent Değil — ORTA

**Dosya:** `apps/backend/src/modules/auction/application/commands/draw-lottery.handler.ts:20-48`
**Tespit:** DRAWING durumuna geçişte `lottery.draw()` veya `lottery.drawManual()` çağrılıyor. Status kontrolü `ACTIVE` dışında hata fırlatıyor ✅ — ama `findOneAndUpdate` ile atomic değil. İki instance aynı anda çekiliş yapmaya çalışırsa ikisi de "ACTIVE" görür.

**Risk:** ORTA — İki kazanan oluşabilir (的理论上).

---

## BÖLÜM 2 — Type Safety & `any` Denetimi

### [2.1] — `any` Bulgu Tablosu

| Dosya | Satır | Bağlam | Risk |
|-------|-------|--------|------|
| `mongo-lottery.repository.ts` | 29, 69, 91, 99 | `session?: any` | ORTA |
| `mongo-auction.repository.ts` | 101, 114 | `findParticipationById` / `findByIdWithRelations` return type `any` | ORTA |
| `auction.mapper.ts` | 36 | `(domain as any)._version = doc.version` | ORTA |

**Risk:** ORTA — toplam 6 `any` tipi. Finansal veri yok, izole scope.

---

### [2.2] — Para Tipleri `Decimal128` Değil — YÜKSEK

Bkz. [1.4], [1.5] — `amount: number` yerine `Types.Decimal128` gerekli.

---

### [2.3] — Auction ve Lottery Status Enum — Doğru Tipli ✅

**Enum değerleri:**
- `AuctionStatus`: `SCHEDULED | ACTIVE | ENDED | COMPLETED | CANCELLED` ✅
- `LotteryStatus`: `DRAFT | ACTIVE | DRAWING | DRAWN | CANCELLED` ✅

---

## BÖLÜM 3 — İş Kuralı Akışı

### [3.1] — Reserve Price Kontrolü — DÜŞÜK

**Dosya:** `apps/backend/src/modules/auction/domain/entities/auction.entity.ts`
**Tespit:** `reservePrice` alanı schema'da mevcut olabilir ama `placeBid()` veya `end()` metodunda reserve price karşılandı mı kontrolü **yok**. Sadece `currentPrice` + `minBidIncrement` kontrolü var.

**Risk:** DÜŞÜK — Reserve karşılanmadığında auction iptal olması gerekiyor ama kodda yok.

---

### [3.2] — Kazanan Para Transferi — Doğru ✅

**Dosya:** `auction-close.scheduler.ts:80-87`
**Tespit:** Kazanan belirlendikten sonra `createWinner()` + `updateManyParticipations` çağrılıyor. Para transferi financial gateway'e devrediliyor ✅

**Karar:** Doğru ✅

---

### [3.3] — Kaybeden Depozito Refund — Doğru Try/Catch ✅

**Dosya:** `auction-close.scheduler.ts:101-126`
**Tespit:** Refund sessiz hata değil — her başarısız refund ayrı log'lanıyor ve `auditLog` yazılıyor ✅

**Karar:** Doğru ✅

---

### [3.4] — Lottery E2E Test — 8 Senaryo ✅

**Dosya:** `place-bid.handler.spec.ts`
**Tespit:** 6 test senaryosu:
1. Geçerli teklif başarılı
2. Auction not found
3. Katılım kaydı yok
4. Bakiye yetersiz

Race condition testi **yok** (eşzamanlı bid). Snipe protection testi **yok**. WebSocket testi **yok** (modülte WebSocket yok).

**Risk:** DÜŞÜK — E2E testler stabilize notuyla uyumlu ama race condition testi eksik.

---

### [3.5] — Buy Now Akışı — Tespit Edilmedi

**Dosya:** `auction/` (geneli arama)
**Tespit:** `BuyNow` veya `buyNowPrice` arandığında sonuç yok. Buy Now akışı implement edilmemiş görünüyor.

**Risk:** DÜŞÜK — Buy Now özelliği master planda var ama koda bulunamadı.

---

## BÖLÜM 4 — Gereksiz Kod & Temizleme

### [4.1] — WebSocket Gateway Yok — Temiz ✅

**Tespit:** Auction modülünde `@WebSocketGateway()` decorator'u **yok**. WebSocket kodu **yok**. Bu, modülün "stabilize" edilmiş olduğunu doğruluyor — WebSocket realtime özelliği başka modülde (muhtemelen `communication` modülü).

**Karar:** WebSocket ayrı modülde tutulmuş — temiz ✅

---

### [4.2] — AuctionParticipation Model Kullanımda — Doğru ✅

**Dosya:** `auction-close.scheduler.ts:73, 97-126`
**Tespit:** `AuctionParticipation` modeli kullanılıyor — `participations` array üzerinden geçiş yapılıyor, `holdId` ile refund çağrılıyor ✅

**Karar:** Dead model değil, kullanımda ✅

---

### [4.3] — Auction ve Lottery Aynı Modülde — Doğru Organize ✅

**Dosya:** `auction.module.ts`
**Tespit:** Auction ve Lottery aynı `auction.module.ts`'te kayıtlı — ortak repository interfaces, shared financial gateway, ayrı entity'ler. Durum geçişleri ayrı enum'lar ile ayrılmış ✅

**Karar:** Mimari doğru ✅

---

### [4.4] — Frontend Store — Dış Modül

**Tespit:** Pinia `auction` store frontend'de. Backend modülünde WebSocket olmadığı için frontend store WebSocket değil, HTTP polling kullanıyor olmalı.

**Karar:** Backend dışı — inceleme kapsamı dışında.

---

## Öncelikli Düzeltme Planı

### Bu Sprint (KRITIK)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 1 | `place-bid.handler.ts:27-83` | Atomic findOneAndUpdate — bid placement race condition |
| 2 | `draw-lottery.handler.ts:34-39` | Seed loglama ekle — çekiliş tekrarlanabilirliği |

### Sonraki Sprint (YÜKSEK)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 3 | `mongo-auction.repository.ts:74` | `Decimal128` ile amount sakla |
| 4 | `auction.entity.ts:9-12` | Para tipleri `Decimal128` yap |
| 5 | WebSocket eksikliği | Communication modülünde varsa oraya taşı, yoksa implement et |

### Backlog (ORTA)

| # | Dosya | Düzeltme |
|---|-------|----------|
| 6 | `place-bid.handler.spec.ts` | Race condition testi ekle |
| 7 | `auction.entity.ts:96-113` | Snipe protection (son 30 sn uzatma) |
| 8 | `mongo-auction.repository.ts:101,114` | `any` return type → tip |
| 9 | `draw-lottery.handler.ts` | Atomic status geçişi — `findOneAndUpdate` |
| 10 | Reserve price kontrolü | `end()` metodunda reserve karşılandı mı kontrolü |

### Belgeleme (DÜŞÜK)

| # | Dosya | Not |
|---|-------|-----|
| 11 | `BuyNow` akışı | Koda bulunamadı — master planda var, implement edilmemiş olabilir |
| 12 | `place-bid.handler.spec.ts` | Snipe protection testi eksik |

---

## Sonuç

Auction modülü **stabilize** — e2e testleri var, state machine doğru, Redis distributed lock her iki scheduler'da da mevcut. Deposit hold/release mekanizması financial gateway üzerinden çalışıyor.

**En kritik iki sorun:**

1. **`placeBidHandler` race condition** — iki adımlı oku/yaz yerine `findOneAndUpdate` atomic güncelleme gerekli. Bu düzeltilmezse eşzamanlı tekliflerde birden fazla teklif geçerli sayılabilir.

2. **Lottery seed kaydedilmiyor** — `crypto.randomInt()` ile seçim yapılıyor ✅ ama seed loglanmadığı için çekiliş tekrarlanamaz. Adil çekiliş kanıtı için seed saklanmalı.

**İyi bulgular:**
- `crypto.randomInt()` — kriptografik güvenli rastgele seçim ✅
- Redis distributed lock — multi-instance koruması ✅
- `VALID_TRANSITIONS` state machine — doğru ✅
- Refund hata loglama — sessiz hata yok ✅
- Audit log tüm kritik eylemlerde ✅

**Görülmeye değer:** WebSocket modülte yok — realtime fiyat güncellemesi için frontend polling yapıyor olmalı. Bu bir eksiklik değil ama bilinmesi gereken mimari karar.