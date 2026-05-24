# Barter Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Barter modülünü birden fazla oturumda inşa ettin ve düzelttiler. `accept-trade-offer` handler'ını üç kez revize ettin: önce compensating refund eklendi, sonra kısmi blokaj (blockedQuantity), sonra atomik transaction. `finalize-swap` handler'ı PENDING_RELEASE akışıyla yeniden yazıldı. `resolve-dispute` idempotency key deterministik yapıldı. Bunların hepsini biliyorsun — kodu okurken bu geçmişi zihninde tut.

Şimdi geri adım at. Tüm bu düzeltmeler pattern düzeyinde ne söylüyor? Hangi kategorik sorunlar hâlâ var? Kodu okuyarak öğren. Tahmin yürütme. Her tespit dosya + satır kanıtı taşısın.

---

## Sistem Bağlamı

**Proje yolu:** `apps/backend/src/modules/barter/`  
**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository (katman atlama yasak)
- Para: `Decimal128` (JS `number` yasak)
- Log: `Logger` (`console.*` yasak)
- Tip: strict TypeScript (`any` yasak)
- Business logic: domain entity'de, handler'da değil

**Mongoose modelleri:**
`SurplusItem`, `SurplusCategory`, `WantedItem`, `TradeOffer`, `TradeOfferItem`, `SwapSession`, `TradeMatch`, `TradeChain`, `TradeCompletion`, `TradeReview`, `DemandMatch`, `BarterPart`, `BarterDisputeLog`, `BatchMatchLog`

---

## Barter İş Kuralları — Bunları Bilmeden İnceleme Yapma

### SwapSession State Machine (Geçişler Katı)

```
TradeOffer: PENDING → ACCEPTED / REJECTED / EXPIRED / COUNTERED
            COUNTERED → PENDING (karşı teklif incelemede)

SwapSession: ACTIVE
             → SHIPPING (her iki taraf kargo bilgisi girer)
             → REVIEWING (her iki taraf teslim aldı, 3 gün dispute window)
             → PENDING_RELEASE (finalize — admin teminat onayı bekler)
             → COMPLETED (admin onayı → escrow release)
             → DISPUTED (herhangi bir aşamada açılabilir)
             → CANCELLED (yalnızca deadline aşımında scheduler tarafından)

BarterPart:  PENDING → SHIPPED → CONFIRMED → DISPUTED
             (her SwapSession iki BarterPart içerir: initiator + receiver)

Teminat akışı:
  accept-trade-offer → holdFunds(initiator) + holdFunds(receiver)
                       → SwapSession.status = ACTIVE
                       → her ikisi SwapSession'a kaydedilir (initiatorHoldId, receiverHoldId)
  finalize-swap      → PENDING_RELEASE (admin onayı gerekli)
  admin onayı        → releaseFunds(initiatorHoldId) + releaseFunds(receiverHoldId) → COMPLETED
  dispute → BUYER    → refundFunds(initiatorHoldId) → releaseFunds(receiverHoldId)
  dispute → SELLER   → refundFunds(receiverHoldId) → releaseFunds(initiatorHoldId)
```

### Kısmi Blokaj (SurplusItem.blockedQuantity)

```
TradeOffer oluşturulunca: SurplusItem.blockedQuantity += requestedQty
Teklif reddedilince/expire olunca: blockedQuantity -= requestedQty
Kabul edilince: blockedQuantity = fullQuantity → status = RESERVED
Atomic $inc ile yapılmalı — race condition riski var
availableQty = quantity - blockedQuantity (hesaplanan, saklanmayan)
SmartCap: tek işlemde havuzun maks %25'i alınabilir
```

### TrustScore Algoritması (3 Bileşen)

```
Ticari performans %40: tamamlanan takas hızı
  → 90 günde işlem yoksa: −10 puan/ay
XP sadakati %30: cüzdandaki XP miktarı
  → Bakiye sıfırlanırsa: −5 puan/ay
Uyumluluk %30: Price Floor + kota uyumu
  → 1. ihlal: uyarı (puan kaybı yok)
  → 2. ihlal: −15 puan
  → 3. ihlal: FREEZE (dondurma — puan cezası değil, durum değişikliği)

Level mapping (⚠️ implement edilmemiş olabilir):
  0–39   → LOW      (freeze candidate)
  40–59  → MEDIUM
  60–79  → HIGH
  80–100 → EXCELLENT
```

### XP Kuralları (50/25/25)

```
Komisyon sübvansiyonu: maks %50 (kalan %50 her zaman nakit)
Reklam/ilan: maks %25 (6 ay kullanılmazsa silinir)
Havuz peşinatı: maks %25 (her işlemde kota tutarının maks %30'u)
XP indirimi + grup içi oran aynı işlemde birlikte uygulanamaz
```

### Batch Matching (02:00 Cron)

```
barter-match.scheduler.ts → barter-match.service.ts.runDailyBatch()
  ACTIVE SurplusItem'ları çek
  WantedItem'larla kategori/keyword/fiyat/konum bazlı eşleştir
  matching.service.ts ile skor hesapla
  DemandMatch kaydet
  Eşleşen taraflara RabbitMQ event → bildirim
Multi-instance güvenliği: tek instance'ın çalışması gerekir (BullMQ lock mu, Redis lock mu?)
```

### Dispute Kuralları

```
3 günlük dispute window: BarterPart.disputeWindowEndsAt (confirmReceipt anında set edilir)
72 saat içinde itiraz → otomatik sistem kararı → manuel inceleme → hakem kurulu
tradeValueInKurus = collateral * 5 * 100 (open-dispute.handler'da düzeltildi)
resolve idempotency key: resolve-{sessionId}-{result} (deterministik — düzeltildi)
Dispute açıkken escrow hold devam eder
```

### Bilinen Açık Nokta (Düzeltilmedi)

```
Session ACTIVE olarak açılıyor (PENDING_COLLATERAL yok)
accept-trade-offer → her iki tarafın holdFunds çağrısı transaction içinde yapılır
UI'da "Teminat Kilitle" adımı informational — gerçek akışla kavramsal tutarsızlık
→ Bu sprint: UI tutarsızlığını raporla, backend akışına dokunma
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 Domain entity kullanımı:**

- `trade-offer.entity.ts` → `accept()` / `reject()` metodları: handler'dan mı çağrılıyor, yoksa handler Mongoose dokümanını doğrudan güncelliyor mu?
- `swap-session.entity.ts` → `releaseCollateral()` metodu var. Bu metod `finalize-swap.handler.ts`'ten mi çağrılıyor? Handler'da inline escrow çağrısı varsa domain bypass.
- `barter-part.entity.ts` ve `surplus-item.entity.ts` — bunlar yeterli mi? Domain metodu hiç yok mu? State geçişleri handler'da mı yapılıyor?
- Handler'lardan herhangi biri entity'yi new'leyip `eventBus.publishAll(entity.domainEvents)` çağırıyor mu? Domain event publish mekanizması çalışıyor mu?

**1.2 `accept-trade-offer` atomiklik denetimi:**

Bu handler üç kez revize edildi. Şu anda gerçekten atomik mi?

```
Kontrol listesi:
  □ session.withTransaction() içinde mi?
  □ holdFunds(initiator) + holdFunds(receiver) transaction içinde mi?
    (gRPC external call olduğu için transaction dışında olmalı — bunu doğrula)
  □ Compensating: receiver hold başarısız → initiator refundFunds
    refundFunds de başarısız olursa ne olur? Bu senaryonun kodu var mı?
  □ SurplusItem.blockedQuantity $inc atomic mı?
    iki eş zamanlı accept isteği → blockedQuantity fazla artabilir mi?
  □ holdId'ler SwapSession'a yazıldı mı? (initiatorHoldId, receiverHoldId)
    Yazılmadıysa finalize-swap escrow release edemez
```

**1.3 Batch matching güvenliği:**

- `barter-match.scheduler.ts` `@Cron` mi BullMQ repeatable job mu?
  - `@Cron`: multi-instance'da her instance çalışır → duplicate DemandMatch
  - BullMQ repeatable: tek instance çalışır → güvenli
- Duplicate DemandMatch koruması: aynı (surplusItemId, wantedItemId) çifti için unique index var mı?
- `runDailyBatch()` uzun sürerse (timeout): yarıda kesilirse DemandMatch tutarlı mı?
- `BatchMatchLog` ne zaman yazılıyor — başta mı, sonda mı, her eşleşmede mi?

**1.4 SwapSession scheduler (timeout taraması):**

- `swap-session.scheduler.ts` → `checkTimeouts()`: hangi session'ları CANCELLED yapıyor?
- CANCELLED yaparken escrow hold serbest bırakılıyor mu? (En kritik soru)
- CANCELLED olunca SurplusItem.blockedQuantity geri düşürülüyor mu?
- TradeOffer TTL index (`expiresAt`) ile scheduler'ın EXPIRED yapması çakışıyor mu?

**1.5 Modül bağımlılık grafiği:**

- `barter.module.ts` import listesini çıkar — hangi modüllere bağımlı?
- `financial-gateway` modülü nasıl bağlı? Global mi, import mu?
- `barter` modülü dışarıya ne export ediyor? `ecosystem` modülü barter'dan bir şey import ediyor mu?
- `chat.controller.ts` communication modülünde mi, barter modülünde mi? Doğru modülde mi?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Tüm barter klasörünü tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/barter/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|
| barter-match.service.ts | 87 | `score: any` | YÜKSEK | `MatchScore` |

Risk seviyeleri:
- `KRİTİK`: Para tutarında `any` — Decimal128 vs number karışıklığı; `blockedQuantity` yanlış hesaplanırsa stok tutarsızlığı
- `YÜKSEK`: TrustScore hesabında `any` — yanlış level atanır, kullanıcı haksız dondurulabilir
- `ORTA`: Matching skoru `any` — yanlış eşleşme, düşük skor teklif gönderilir
- `DÜŞÜK`: İzole scope, cascade riski yok

**Adım 3:** Matching servisinde özellikle ara:

`matching.service.ts` skor hesabı için muhtemelen ara tipler kullanıyor. `any` varsa:

```typescript
// Doğru tipler:
interface MatchScore {
  categoryScore: number;      // 0-1
  keywordScore: number;       // 0-1
  priceCompatibility: number; // 0-1
  locationScore: number;      // 0-1
  totalScore: number;         // ağırlıklı toplam
}

interface MatchCandidate {
  surplusItem: SurplusItemDocument;
  wantedItem: WantedItemDocument;
  score: MatchScore;
  isSmartCapSafe: boolean; // %25 cap aşılmıyor mu?
}
```

**Adım 4:** TrustScore servisinde — level mapping eksikliği `any`'den mi kaynaklanıyor?

`trust-score-calculator.service.ts` `⚠️ Puan → level mapping görünmüyor` notu var. Bunu bul:

```typescript
// Olması gereken:
export const TRUST_SCORE_LEVELS = {
  LOW:       { min: 0,  max: 39  },
  MEDIUM:    { min: 40, max: 59  },
  HIGH:      { min: 60, max: 79  },
  EXCELLENT: { min: 80, max: 100 },
} as const;

export type TrustLevel = keyof typeof TRUST_SCORE_LEVELS;

export function scoreToLevel(score: number): TrustLevel {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}
```

Level mapping olmadan `trustLevel` field'ı nasıl set ediliyor? `any` mi, hard-coded string mi?

**Adım 5:** `estimatedValue` fallback zincirindeki tipler:

`offers.controller` ve `accept-trade-offer.handler`'da `estimatedValue fallback: item → props → unitPrice*qty` var. Bu zincirde her adımda tip kontrolü yapılıyor mu?

```typescript
// Fallback zincirinin tipli hali:
function resolveEstimatedValue(
  item: TradeOfferItemDocument,
  surplusItem: SurplusItemDocument | null,
): Types.Decimal128 {
  if (item.estimatedValue) return item.estimatedValue;
  if (surplusItem?.estimatedValue) return surplusItem.estimatedValue;
  if (item.unitPrice && item.quantity) {
    const val = parseFloat(item.unitPrice.toString()) * item.quantity;
    return Decimal128.fromString(val.toFixed(2));
  }
  throw new BadRequestException('estimatedValue resolve edilemedi');
}
```

Bu fonksiyon mevcut mu? Inline if/else mi?

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — SwapSession status dallanması:**
```typescript
// Kötü — handler veya servis'te:
if (session.status === 'ACTIVE') { ... }
else if (session.status === 'SHIPPING') { ... }
else if (session.status === 'REVIEWING') { ... }
else if (session.status === 'PENDING_RELEASE') { ... }
// → trade-state-machine.service.ts bunu handle etmesi gerekir
// Mevcut state machine bu if/else'i kapsıyor mu?
// Eksikse nasıl tamamlanır — kodu yaz
```

**Pattern B — TradeOffer tipi dallanması:**
```typescript
// CashDirection enum: NONE | TO_INITIATOR | TO_RECEIVER | BOTH
// Her direction için farklı komisyon/escrow hesabı var mı?
// Bu dallanma nerede — handler'da mı, domain entity'de mi?
if (offer.cashDirection === 'NONE') { ... }
else if (offer.cashDirection === 'TO_INITIATOR') { ... }
// → Strategy veya domain method ile nasıl yerine geçilir? Kodu yaz
```

**Pattern C — TrustScore ceza hesabı:**
```typescript
// Kötü — inline if/else:
if (daysSinceLastTrade > 90) { score -= 10; }
if (xpBalance === 0) { score -= 5; }
if (violationCount === 2) { score -= 15; }
if (violationCount >= 3) { freeze = true; }
// → Ceza tablosu (TRUST_SCORE_PENALTIES sabit) + policy object nasıl kullanılır? Kodu yaz
```

**Pattern D — ShipmentMode dallanması (DIGITAL eklendi):**
```typescript
// submit-shipping.handler.ts'de:
if (session.shipmentMode === 'DIGITAL') {
  // kargo kodu yok, anında confirm
} else if (session.shipmentMode === 'CARRIER') {
  // regex validasyon
} else {
  // standart
}
// Bu pattern şu an var mı? Varsa nasıl temizlenir — kodu yaz
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti:**

**Antipattern A — Compensating refund'da hata yutma (KRİTİK):**
```typescript
// Kötü — accept-trade-offer'da:
} catch (receiverHoldErr) {
  try {
    await escrow.refundFunds(initiatorHoldId); // başarısız olursa?
  } catch { /* sessiz */ }
  throw receiverHoldErr;
}
// → Para initiator'dan çekildi ama iade yok
// Doğru: compensating action'ı da loglayarak yut, alert gönder
```

**Antipattern B — Batch matching'de sessiz devam:**
```typescript
// Kötü — runDailyBatch'de:
for (const surplus of items) {
  try {
    await this.matchAndSave(surplus);
  } catch { continue; } // hata sessizce geçiliyor
}
// → Hangi item'ların match edilemediği bilinmiyor
// Doğru: hata say, BatchMatchLog'a yaz, threshold aşınca admin alert
```

**Antipattern C — Session timeout'ta escrow unsafety:**
```typescript
// swap-session.scheduler.ts → checkTimeouts():
// CANCELLED yaparken escrow release tetikleniyor mu?
// Tetiklenmiyorsa: teminat sonsuza HELD kalır
// Tetikleniyorsa: release başarısız olursa session CANCELLED ama para hâlâ bloke
```

**Antipattern D — SurplusItem blockedQuantity race condition:**
```typescript
// Kötü — iki eş zamanlı accept isteği:
const surplus = await surplusRepo.findById(id);
if (surplus.availableQty >= requested) {
  await surplusRepo.update(id, {
    blockedQuantity: surplus.blockedQuantity + requested
  });
}
// → findOneAndUpdate + $inc + $expr koşulu ile atomic yap:
await surplusModel.findOneAndUpdate(
  {
    _id: surplusId,
    $expr: { $lte: [{ $add: ['$blockedQuantity', requestedQty] }, '$quantity'] }
  },
  { $inc: { blockedQuantity: requestedQty } },
  { new: true, session }
);
// null dönerse: yeterli stok yok (concurrent accept kazandı)
```

**3.3 `trade-state-machine.service.ts` analizi:**

Bu servis var ama yeterli mi?

```
Kontrol listesi:
  □ TradeOffer geçişleri burada mı tanımlı, yoksa her handler'da inline mi?
  □ SwapSession geçişleri burada mı, yoksa session entity'de mi?
  □ VALID_TRANSITIONS map var mı? Formatlı:
    { [from: SessionStatus]: SessionStatus[] }
  □ Geçersiz transition'da typed exception mi, generic Error mi?
  □ BarterPart geçişleri (PENDING → SHIPPED → CONFIRMED) burada mı?
```

Eksikleri tespit et, tamamlanmış state machine kodunu yaz.

**3.4 Business rule sızıntısı:**

- `SmartCap (%25)` kontrolü `watchtower.service.ts`'de mi, handler'da mı, controller'da mı?
- `collateral-calculator.service.ts` (%20 teminat) domain value object mı, utility function mı?
- XP 50/25/25 kuralı `b2b-xp-rules.service.ts`'te mi, yoksa handler'lara dağılmış mı?
- `tradeValueInKurus = collateral * 5 * 100` hesabı `open-dispute.handler.ts`'te inline mi? Domain service'e taşınmalı.

Her sızıntı için: nerede, nerede olmalı, taşıma kodu.

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Dead code tespiti:**

```bash
grep -rn "^export" apps/backend/src/modules/barter/ --include="*.ts" | \
  grep -oP '(?<=class |function |const |interface |enum )\w+' | \
  sort -u | while read name; do
    refs=$(grep -rn "\b$name\b" apps/backend/src/ --include="*.ts" | wc -l)
    [ "$refs" -le 1 ] && echo "POSSIBLE DEAD: $name"
  done
```

Özellikle şunlara bak:
- `TradeChain` ve `TradeCompletion` modelleri: gerçekten kullanılıyor mu? Handler var mı?
- `TradeMatch` modeli: `DemandMatch` yerine mi kullanılıyor, yoksa ikisi ayrı şey mi?
- `BatchMatchLog`: yazılıyor mu, okunuyor mu?

**4.2 Duplicate logic tespiti:**

- `estimatedValue` resolve mantığı kaç handler'da tekrar ediyor? (En az 3: create-offer, accept-offer, counter-offer) → shared util fonksiyon
- `companyId → vendorId → userId` çözümleme zinciri kaç handler'da tekrar ediyor? → shared resolver service
- `blockedQuantity` artırma/azaltma mantığı kaç yerde? → SurplusItem repository method'u
- SwapSession'ı populate ile fetch etme (offeredItems, requestedItems, company) kaç handler'da? → `findByIdWithRelations` repository metoduna topla (yapıldı mı kontrol et)

Her duplicate için: kaç yerde, shared utility nasıl yazar — kodu yaz.

**4.3 `barter.module.ts` şişkinlik analizi:**

- Schema kayıtları (`MongooseModule.forFeature`) kaç model içeriyor?
- Provider listesi kaç servis/handler içeriyor?
- `imports` listesinde hiç kullanılmayan modül var mı?
- Module'ün `exports` listesi ihtiyaçtan fazla mı? Diğer modüller gereksiz şeylere erişiyor mu?

**4.4 Scheduler dosya analizi:**

İki scheduler var: `barter-match.scheduler.ts` ve `swap-session.scheduler.ts`

Her biri için:
- `@Cron` mi BullMQ repeatable mı? (Cron = multi-instance'da tehlike)
- Cron ise: Redis distributed lock var mı?
- Manuel tetikleme endpoint'i var mı? (var — `run-timeout-check`)
- Bu manuel endpoint'ler admin controller'da mı, scheduler'da mı?

**4.5 Frontend bağlantılı backend kontrol:**

`ticaritakas.md`'de silinen `chat/[offerId].vue` — bu sayfaya endpoint hizmet veren controller endpoint'i backend'de hâlâ var mı? Varsa dead endpoint — sil.

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Dosya:** `apps/backend/src/modules/barter/path/to/file.ts:satır`
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

1. **KRİTİK** — `blockedQuantity` race condition (stok tutarsızlığı), compensating refund sessiz yutma (para kaybı), timeout'ta escrow release eksikliği (teminat sonsuza HELD), batch matching duplicate (kullanıcı aynı teklifi iki kez alır)
2. **YÜKSEK** — TrustScore level mapping eksikliği, session state machine eksikleri, ShipmentMode DIGITAL akışı
3. **ORTA** — Duplicate logic (estimatedValue, companyId çözümleme), dead models (TradeChain, TradeCompletion), scheduler @Cron güvenliği
4. **DÜŞÜK** — Dead code, naming, minor refactor

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **SwapSession state machine geçiş isimleri** — frontend composable'lar bağımlı
- **TrustScore ağırlıkları (%40/%30/%30)** — iş kararı
- **SmartCap %25 eşiği** — iş kararı
- **Collateral %20 oranı** — iş kararı
- **`resolve-{sessionId}-{result}` idempotency key formatı** — düzeltildi, bozma
- **`tradeOffer CashDirection` enum değerleri** — düzeltildi, bozma
- **`barter-admin.controller.ts` endpoint URL'leri** — frontend bağımlı
- **PENDING_COLLATERAL akışının eklenmesi** — açık nokta, bu sprint değil (sadece raporla)
- **Batch matching algoritması** — matching skorlama iş mantığı, skor ağırlıklarını değiştirme

---

## Son Not

Barter modülünde üç kategorik risk var ve bunların üçü de birbirine bağlı:

`blockedQuantity` race condition → iki vendor aynı anda aynı ürünü bloke edebilir → hangisinin SwapSession'ı gerçek, hangisi hayali?

Timeout'ta escrow release eksikliği → SwapSession CANCELLED ama teminat HELD → kullanıcı cüzdanına bakıyor, para yok, neden yok biliyor mu?

Compensating refund sessiz yutma → receiver hold başarısız, initiator para bloke → kullanıcı teklif iptal etti ama parası hâlâ gitmiş görünüyor.

Bu üç senaryo üst üste gelirse kullanıcı parası gerçekten kaybolur. Bunları önce raporla.
