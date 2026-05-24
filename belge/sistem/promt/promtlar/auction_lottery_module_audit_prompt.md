# Auction & Lottery Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Auction modülü "18 dosya — stabilize edildi" notunu taşıyor — e2e testleri var (`auction-bid.spec.ts`, 8 senaryo), Pinia store tamamlandı (`auction`, `lottery`). "Stabilize" bir modülün sorunsuz olduğu anlamına gelmez: stabilizasyon genellikle "çalışıyor ama derinlemesine incelenmedi" demektir.

İki sistem aynı modülde yaşıyor ama kökten farklı: Auction gerçek zamanlı rekabetçi fiyatlama (WebSocket, race condition riski, escrow), Lottery olasılık tabanlı çekiliş (seed, tekrar yeniden üretilebilirlik, ödül dağıtımı). Bu ikisini birbirinden net ayırarak incele.

Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/auction/`

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose · Socket.io (WebSocket)  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Para: `Decimal128` (bid fiyatları, reserve price, buy-now fiyatı)
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)
- Business logic: domain entity'de

**Mongoose modelleri (6 adet):**
```
Auction          → Ana artırma kaydı (listingId, status, bids ilişkisi)
AuctionBid       → Teklif kaydı (userId, amount, createdAt)
AuctionParticipation → Katılım kaydı (deposit hold?)
AuctionWinner    → Kazanan kaydı
Lottery          → Piyango kaydı
LotteryTicket    → Bilet kaydı
```

**Frontend:**
```
Pinia store: auction, lottery
E2E test: auction-bid.spec.ts (8 senaryo)
Section S7: Auction + Lottery ✅
```

---

## Auction & Lottery İş Kuralları — Bunları Bilmeden İnceleme Yapma

### Auction (Açık Artırma) İş Kuralları

**Temel akış:**
```
Auction oluştur (admin veya vendor) → DRAFT
  → ACTIVE (başlangıç saati geldi)
  → Katılımcılar teklif verir → AuctionBid
  → Süre doldu → ENDED
  → Kazanan belirlendi → AuctionWinner
  → Ödeme tamamlandı → COMPLETED
  → Zaman aşımı / ödeme yapılmadı → FAILED / RE_LISTED
```

**Teklif kuralları:**
```
Her yeni teklif önceki tekliften yüksek olmalı
Minimum artırım adımı var mı? (örn: min 10 ₺ artırım)
Kendi teklifinin üstüne teklif veremezsin (mevcut en yüksek teklifçi)
Rezerv fiyatı (reserve price): açıklanmamış minimum satış fiyatı
  → Reserve'e ulaşılmadıysa auction iptal
"Buy Now" fiyatı: anında satın alma seçeneği
  → Buy Now kullanılırsa auction anında biter
Snipe protection: Son N saniyede teklif gelirse süre uzar mı?
```

**WebSocket gerçek zamanlı:**
```
Teklif verildiğinde tüm katılımcılara broadcast: yeni fiyat + teklif veren
Süre dolmaya N sn kaldığında broadcast
Auction bittiğinde broadcast
```

**Katılım depozitosu (AuctionParticipation):**
```
Katılmadan önce depozito gerekiyor mu?
  → escrow holdFunds?
  → Kazanmayan geri alıyor mu?
  → Kaybedenin depozitosu ne zaman refund ediliyor?
```

**Kazanan belirleme:**
```
Süre dolunca: en yüksek teklif sahibi kazanır
  → Ödeme için N süre tanınır (örn: 24 saat)
  → Ödeme yapılmazsa: sonraki en yüksek teklif sahibi mi, yeniden listelenme mi?
```

### Lottery (Piyango/Çekiliş) İş Kuralları

**Temel akış:**
```
Lottery oluştur (admin) → DRAFT
  → ACTIVE (bilet satışı başladı)
  → bilet satışı devam ediyor → LotteryTicket
  → DRAWING (çekiliş yapılıyor)
  → COMPLETED (kazanan açıklandı)
```

**Bilet kuralları:**
```
Kişi başına maksimum bilet sayısı var mı?
Bilet fiyatı sabit mi?
Toplam bilet sayısı sınırlı mı?
Bilet satışı bitince otomatik DRAWING'e geçiyor mu?
```

**Kazanan belirleme:**
```
Rastgele seçim nasıl yapılıyor?
  → Math.random()? (Güvensiz — seed fix edilebilir)
  → Crypto-safe random? (Node.js crypto.randomInt)
  → Seed kaydediliyor mu? (Adil çekiliş kanıtı için)
Birden fazla kazanan var mı?
Kazanan bileti kim doğruluyor?
```

**Ödül dağıtımı:**
```
Kazanan ödülü nasıl alıyor?
  → Wallet transfer mi?
  → Fiziksel ödül mi?
  → Voucher/kupon mu?
Ödül dağıtımı atomic mi?
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 Auction ve Lottery ayrımı:**

- İki sistem aynı `auction.module.ts`'te mi, yoksa ayrı modüller mi?
- Aynı `auction.controller.ts`'te mi yoksa `auction.controller.ts` + `lottery.controller.ts` ayrı mı?
- Ortak kullanılan servis var mı? (Örn: ortak bir `random.service.ts`)

**1.2 WebSocket mimarisi:**

```
Kontrol listesi:
  □ Auction için özel bir `@WebSocketGateway()` var mı?
    Yoksa genel communication/chat gateway'i mi kullanılıyor?
  □ WebSocket room yapısı: her auction için ayrı room mu?
    (auction-{id} room'u)
  □ Teklif verildiğinde kim broadcast ediyor?
    Handler mı → Gateway mı event emit ediyor?
    Doğrudan gateway'den DB yazıyor mu? (anti-pattern)
  □ Socket.io namespace'i nedir? /auction mı, /default mi?
  □ Authentication: WebSocket bağlantısında JWT kontrolü var mı?
    (AnonymousUser teklif verebiliyor mu?)
```

**1.3 Teklif atomikliği — en kritik alan:**

```
Aynı anda iki kullanıcı aynı fiyatla teklif verirse ne olur?

Kontrol listesi:
  □ place-bid.handler.ts'te mevcut en yüksek teklif kontrolü:
    SELECT FOR UPDATE mu, atomic findOneAndUpdate mu?
  □ Race condition: iki eş zamanlı istek ikisi de "şu an en yüksek teklif X" görür
    → Her ikisi de X+1 ile teklif verirse hangisi kazanır?
  □ MongoDB session (transaction) kullanılıyor mu?
  □ AuctionBid yazımı + Auction.currentBid güncellemesi aynı session'da mı?
  □ "Kendi teklifinin üstüne teklif veremezsin" kontrolü atomic mi?
```

**1.4 Auction durum geçişleri:**

```
  □ DRAFT → ACTIVE: scheduler mı tetikliyor, admin manuel mi?
  □ ACTIVE → ENDED: süresi dolunca kim tetikliyor?
    @Cron mu, BullMQ delayed job mu?
  □ ENDED → COMPLETED/FAILED: ödeme alındıktan sonra mı?
  □ Multi-instance: iki backend instance aynı anda auction kapatmaya çalışırsa?
    (MongoDB findOneAndUpdate ile atomic geçiş var mı?)
```

**1.5 Lottery çekiliş güvenliği:**

```
  □ Kazanan seçimi nasıl yapılıyor?
    Math.random() → KABUL EDİLEMEZ (seed ile manipüle edilebilir)
    crypto.randomInt() → GÜVENLİ
  □ Çekiliş seed'i kaydediliyor mu?
    (Şikayete karşı kanıt: "bu seed ile bu çekiliş yapıldı")
  □ Çekiliş tekrarlanabilir mi? (aynı seed → aynı kazanan)
  □ Admin çekilişi iptal edip yeniden yapabilir mi?
    Yoksa DRAWING'e girince geri dönüş yok mu?
```

**1.6 Modül bağımlılık grafiği:**

- `auction.module.ts` hangi modüllere bağımlı?
- `financial-gateway` modülü: depozito için escrow hold kullanılıyor mu?
- `catalog.module.ts`: `Auction.listingId` → Listing bağlantısı nasıl kurulmuş?
- `communication.module.ts`: WebSocket gateway paylaşılıyor mu?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm auction klasörünü tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/auction/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| place-bid.handler.ts | ? | `bid: any` | KRİTİK | `PlaceBidDto` |
| auction.gateway.ts | ? | `payload: any` | YÜKSEK | `BidPayload` |

Risk seviyeleri:
- `KRİTİK`: Teklif miktarı `any` → `Decimal128` yerine `number` → floating-point hata, yanlış sıralama
- `YÜKSEK`: WebSocket payload `any` → sahte mesaj kabul edilir, userId manipüle edilebilir
- `ORTA`: Auction response `any` → frontend yanlış veri render eder
- `DÜŞÜK`: İzole scope, cascade yok

**Adım 3:** Teklif miktarı tip güvensizliği — kritik:

```typescript
// Auction bid'in doğru tipleri:
interface PlaceBidDto {
  auctionId: string;
  amount: string;          // Decimal128.fromString(amount) ile parse edilmeli
}

interface AuctionBidDocument {
  _id: Types.ObjectId;
  auctionId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: Types.Decimal128;     // number değil — sıralama garantisi için
  createdAt: Date;
  isWinning: boolean;
}

// En yüksek teklif sorgusu — Decimal128 doğru sıralanıyor mu?
// MongoDB'de Decimal128 sayısal sıralama yapabiliyor: ✅
// JavaScript'te Decimal128 karşılaştırması: parseFloat().toString() gerekli
```

**Adım 4:** WebSocket gateway payload tipleri:

Socket.io mesajları `any` tipinde geliyor olabilir. Doğru tipler:

```typescript
// Server → Client olayları:
interface AuctionBidPlacedEvent {
  auctionId: string;
  newAmount: string;           // Decimal128.toString()
  bidderId: string;            // anonim mı, açık mı?
  bidderAlias?: string;        // "Kullanıcı-4521" gibi
  remainingSeconds: number;
  bidCount: number;
}

interface AuctionEndedEvent {
  auctionId: string;
  winnerId?: string;
  winningAmount?: string;
  reason: 'TIME_UP' | 'BUY_NOW' | 'RESERVE_NOT_MET' | 'CANCELLED';
}

// Client → Server olayları:
interface PlaceBidSocketPayload {
  auctionId: string;
  amount: string;
}
```

**Adım 5:** Lottery ticket ve kazanan tipler:

```typescript
interface LotteryTicketDocument {
  _id: Types.ObjectId;
  lotteryId: Types.ObjectId;
  userId: Types.ObjectId;
  ticketNumber: number;        // sıralı numaralandırma mı, UUID mi?
  purchasedAt: Date;
  price: Types.Decimal128;
}

interface LotteryWinnerDocument {
  lotteryId: Types.ObjectId;
  userId: Types.ObjectId;
  ticketId: Types.ObjectId;
  winningTicketNumber: number;
  seed: string;                // çekiliş kanıtı için
  selectedAt: Date;
  rewardClaimed: boolean;
  rewardClaimedAt?: Date;
}
```

Bu tipler mevcut mu? `any` ile mi kullanılıyor?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — Auction durum dallanması:**
```typescript
// Kötü:
if (auction.status === 'DRAFT') { throw ... }
else if (auction.status === 'ACTIVE') { /* teklif al */ }
else if (auction.status === 'ENDED') { throw ... }
else if (auction.status === 'COMPLETED') { throw ... }
// → Auction entity'sinde canBid(), canEnd(), canComplete() metodları olmalı
class AuctionEntity {
  canBid(): boolean {
    return this.status === 'ACTIVE' && new Date() < this.endsAt;
  }
  canBuyNow(): boolean {
    return this.canBid() && this.buyNowPrice != null;
  }
}
```

**Pattern B — Buy Now vs normal bid ayrımı:**
```typescript
// Kötü — place-bid.handler.ts'te:
if (dto.isBuyNow) {
  // farklı akış
} else {
  // normal teklif
}
// → Ayrı komutlar: PlaceBidCommand ve BuyNowCommand
```

**Pattern C — Rezerv fiyat kontrolü:**
```typescript
// Kötü:
if (auction.reservePrice) {
  if (winningBid.amount < auction.reservePrice) {
    // rezerv karşılanmadı
  }
}
// → Auction entity metodunda:
isReserveMet(winningAmount: Decimal128): boolean
```

**Pattern D — Lottery kazanan seçim:**
```typescript
// Kötü — Math.random() kullanımı:
const winnerIndex = Math.floor(Math.random() * tickets.length);
// → Güvenli versiyon:
import { randomInt } from 'crypto';
const winnerIndex = randomInt(0, tickets.length);
// Seed kaydı:
const seed = crypto.randomBytes(32).toString('hex');
// seed + ticketList → deterministic winner için hash
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — Teklif yarış koşulu (KRİTİK):**
```typescript
// Kötü — iki adımlı kontrol + yazım:
const auction = await Auction.findById(auctionId);
if (bid.amount <= auction.currentBid) throw new BadRequestException();
const savedBid = await AuctionBid.create({ ...bid });
await Auction.updateOne({ _id: auctionId }, { currentBid: bid.amount });
// → İki eş zamanlı istek: ikisi de currentBid kontrolünden geçer, ikisi de yazar
// Yanlış kazanan belirlenir

// Doğru — atomic:
const updated = await Auction.findOneAndUpdate(
  {
    _id: auctionId,
    status: 'ACTIVE',
    $or: [
      { currentBid: null },
      { currentBid: { $lt: Types.Decimal128.fromString(bid.amount) } }
    ]
  },
  { $set: { currentBid: Types.Decimal128.fromString(bid.amount), leadingBidderId: bid.userId } },
  { new: true, session }
);
if (!updated) throw new ConflictException({ code: 'BID_OUTBID_OR_CLOSED' });
```

**Antipattern B — Auction kapatmada çift tetikleme:**
```typescript
// @Cron + WebSocket timeout çakışması:
// Scheduler: auction süresi doldu → ENDED yap
// WebSocket: son bid anında süre doldu → ENDED yap
// İkisi aynı anda tetiklenirse?
// → findOneAndUpdate + { status: { $ne: 'ENDED' } } koşuluyla atomic:
const closed = await Auction.findOneAndUpdate(
  { _id: auctionId, status: 'ACTIVE' },
  { $set: { status: 'ENDED', endedAt: new Date() } },
  { new: true }
);
if (!closed) return; // zaten kapatılmış, çift tetikleme önlendi
```

**Antipattern C — Depozito refund sessiz hata:**
```typescript
// Kaybeden katılımcıların depozitosu geri veriliyor mu?
// Auction COMPLETED olduğunda:
for (const participation of losers) {
  try {
    await escrow.refundFunds(participation.holdId);
  } catch {
    // Para askıda kaldı — kimse fark etmez
  }
}
// Doğru: başarısız refund'ları retry queue'ya ekle + admin alert
```

**Antipattern D — Lottery çekiliş idempotency:**
```typescript
// Admin "çekiş yap" butonuna iki kez bastı:
// İlk: winner seçildi, LotteryWinner oluştu
// İkinci: tekrar winner seçildi, ikinci LotteryWinner oluştu
// → Lottery.status kontrolü atomic değilse iki kazanan

// Doğru:
const lottery = await Lottery.findOneAndUpdate(
  { _id: lotteryId, status: 'ACTIVE' },
  { $set: { status: 'DRAWING' } },
  { new: true }
);
if (!lottery) throw new ConflictException('Already drawing or completed');
// Sadece bu atomic update'i alan instance çekiliş yapabilir
```

**Antipattern E — WebSocket odası yönetiminde hata:**
```typescript
// Kullanıcı join oldu ama disconnect event işlenmedi:
// → Room'da hayalet bağlantılar birikir
// → broadcast'te hata oluşturabilir
// Socket.io disconnect event'i handler'ı var mı?
gateway.on('disconnect', (socket) => {
  socket.rooms.forEach(room => socket.leave(room));
});
```

**3.3 Snipe protection (son saniyelerde uzatma) var mı?**

```
Birçok artırma platformu "last-minute sniping"i önler:
Son 30 saniyede teklif gelirse süre 30 saniye daha uzatılır

Kontrol:
  □ Bu özellik implement edilmiş mi?
  □ Yoksa sniper avantajlıdır — son saniyede teklif vererek kazanabilir
  □ Business rule mu değil mi? → master plan veya koda bak
  □ Eğer yoksa ve eklenmesi gerekiyorsa:
    place-bid.handler.ts'te:
    if (auction.endsAt - Date.now() < SNIPE_WINDOW_MS) {
      auction.endsAt = new Date(Date.now() + SNIPE_EXTENSION_MS);
      // broadcast: süre uzatıldı
    }
```

**3.4 Business rule sızıntısı:**

- `auction.canBid()` gibi domain metodları var mı, yoksa `auction.status === 'ACTIVE'` kontrolü handler'da mı?
- Kazanan belirleme mantığı handler'da mı, domain entity'de mi?
- Minimum artırım adımı sabit mi, admin'den konfigüre edilebilir mi?
- Reserve price hesabı nerede — entity'de mi, handler'da inline mi?

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Dead code tespiti:**

```bash
grep -rn "^export" \
  apps/backend/src/modules/auction/ \
  --include="*.ts" \
  | grep -oP '(?<=class |function |const |interface |enum )\w+' \
  | while read name; do
      refs=$(grep -rn "\b$name\b" apps/backend/src/ --include="*.ts" | wc -l)
      [ "$refs" -le 1 ] && echo "POSSIBLE DEAD: $name"
    done
```

**4.2 `AuctionParticipation` modeli analizi:**

Bu model ne için? Katılım depozitosu mu, sadece tracking mi?

```bash
grep -rn "AuctionParticipation\|participation" \
  apps/backend/src/modules/auction/ \
  --include="*.ts"
```

- Depozito hold mekanizması var mı? (escrow holdFunds)
- Kaybedenlerin depozitosu otomatik refund ediliyor mu?
- Bu model gerçekten kullanılıyor mu?

**4.3 Auction ve Lottery kod paylaşımı:**

İki sistem arasında hangi kod paylaşılıyor, hangisi duplicate?

- Durum geçiş şablonu her ikisinde de ayrı ayrı mı implement edildi?
- Scheduler pattern (ACTIVE → ENDED, bilet satış → DRAWING) duplicate mu?
- `BaseAuction` veya `BaseRaffle` abstract class var mı?

**4.4 E2E test kapsamı vs gerçek implementation:**

`auction-bid.spec.ts` 8 senaryo içeriyor. Testleri oku:

- Hangi senaryolar test ediliyor?
- Race condition testi var mı? (Eşzamanlı bid)
- WebSocket gerçek zamanlı test var mı?
- Reserve price senaryosu test edilmiş mi?
- Test edilen ama implement edilmemiş senaryo var mı?
- Implement edilmiş ama test edilmeyen kritik senaryo var mı?

**4.5 Frontend state vs Backend state tutarlılığı:**

Pinia `auction` store'u ile backend state'i tutarlı mı?

```bash
# Frontend store:
grep -rn "auction.*store\|useAuction\|auctionStore" \
  apps/frontend/ \
  --include="*.ts" --include="*.vue"
```

- Store'da `currentBid`, `status`, `timeRemaining` var mı?
- WebSocket event'leri doğru store mutation'larını tetikliyor mu?
- Store sıfırlanıyor mu? (Kullanıcı farklı auction'a geçtiğinde)

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/src/modules/auction/path/to/file.ts:satır`
**Tespit:** [Ne buldun]
**Risk:** KRİTİK / YÜKSEK / ORTA / DÜŞÜK
**Sorun:** [Neden sorun — tek cümle]

**Düzeltme:**
```typescript
// Tam, çalışır, copy-paste edilebilir kod
```

**Cascade etkisi:** [Bu değişiklik başka neyi etkiler]
```

---

## Önceliklendirme

1. **KRİTİK** — Teklif race condition (iki kullanıcı aynı anda kazanıyor), Lottery `Math.random()` kullanımı (manipüle edilebilir), Auction çift kapatma (scheduler + WebSocket aynı anda ENDED), WebSocket authentication eksikliği (anonim teklif)
2. **YÜKSEK** — Kaybeden depozitosu refund sessiz hata, Lottery çekiliş idempotency eksikliği, Teklif Decimal128 yerine number tipinde saklanması
3. **ORTA** — Snipe protection yok, domain entity metodları handler'da inline, AuctionParticipation dead model mı?
4. **DÜŞÜK** — E2E test gap'leri, Frontend store sıfırlama, Duplicate scheduler pattern

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **Auction ve Lottery'nin aynı modülde yaşaması** — mimari karar
- **Minimum artırım adımı değeri** — iş kararı, konfigüre edilebilir yap
- **Reserve price açıklanma politikası** — iş kararı
- **Lottery bilet fiyatı yapısı** — iş kararı
- **E2E testlerin senaryoları** — bozma, eksik olanları ekle
- **Socket.io namespace** — diğer sistemler bağımlı, değiştirme

---

## Son Not

Auction modülünün iki kritik riski var:

**Teklif race condition** — İki kullanıcı aynı millisecond'da teklif verirse atomik kontrol olmadan ikisi de kazanıyor. findOneAndUpdate + koşullu filtre olmadan bu kaçınılmaz. Üretimde yüksek trafikli artırmalarda (popüler ürün, son saniyeler) bu senaryo kesinlikle gerçekleşir.

**Lottery `Math.random()`** — Node.js `Math.random()` V8 engine'in PRNG'sini kullanır. Seed bilinirse manipüle edilebilir. Platform adına ciddi güven sorunu yaratır. `crypto.randomInt()` bir satır değişiklik — risk sıfıra indirilir.

Bu ikisi önce. Geri kalanı sonra.
