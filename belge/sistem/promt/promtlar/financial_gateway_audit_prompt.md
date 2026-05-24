# Financial-Gateway Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Financial-gateway'i ve financial-service'i sen tasarladın. Cüzdan bakiye tutarsızlığının, çift escrow hold'un veya kayıp refund'ın ne anlama geldiğini biliyorsun — bu hatalar kullanıcı parasının kaybolması demektir. Tahmin yürütme. Her tespit kod kanıtına dayansın. "Belki" ve "önerilir" kullanma — net konuş.

---

## Sistem Bağlamı

**İki katman birlikte incelenecek:**

```
apps/
  backend/
    src/modules/
      financial-gateway/          ← HTTP → gRPC köprüsü (21 dosya)
        wallet.controller.ts      GET /wallet, /wallet/transactions
                                  POST /wallet/topup, /wallet/withdraw
        wallet-admin.controller.ts  GET/POST /admin/wallet/*
        financial-gateway.service.ts  gRPC çağrılarını orchestrate eder
        grpc/
          wallet-grpc.service.ts  financial-service'e gRPC bağlantısı
          escrow-grpc.service.ts  Escrow hold/release/refund

  financial-service/              ← Ayrı NestJS gRPC microservice (port 50051)
                                     Cüzdan bakiye, escrow, çekim yönetimi
```

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose  
**İletişim:** gRPC (Protobuf) — `FINANCIAL_GRPC_URL=financial-service:50051`  
**Para birimi:** `Decimal128` (JS `number` yasak — tüm para hesaplarında)  
**Pattern:** Controller → CommandBus/QueryBus → Handler → Repository  
**Log:** `Logger` (`console.*` yasak) · Tip: strict TypeScript (`any` yasak)

**Kritik sistem notu:**  
`gRPC field numbers` düzeltmesi geçmişte yapıldı:  
`ReleaseFunds/RefundFunds: holdId=1, idempotencyKey=2` — bu sıra doğru, bozma.

---

## Financial-Gateway İş Kuralları — Bunları Bilmeden İnceleme Yapma

### Escrow Akışı (Sıra Değiştirilemez)

```
Checkout:
  1. holdFunds(userId, amount, idempotencyKey)  → holdId döner
  2. Order oluşturulur — holdId Order'a yazılır
  3. Sipariş DELIVERED:
     releaseFunds(holdId, vendorId, idempotencyKey)  → vendor'a transfer

İade:
  refundFunds(holdId, userId, idempotencyKey)  → kullanıcıya iade

TicariTakas teminat:
  holdFunds(initiatorId, collateral, key)  → initiatorHoldId
  holdFunds(receiverId, collateral, key)   → receiverHoldId
  finalize → PENDING_RELEASE → admin onayı → releaseFunds × 2
  dispute → RESOLVED_FOR_BUYER → refundFunds | RESOLVED_FOR_SELLER → releaseFunds

P2P transfer (barter):
  holdFunds(senderId, amount, key) → releaseFunds(holdId, receiverId, key)
```

**idempotencyKey zorunluluğu — en kritik kural:**

Her `holdFunds`, `releaseFunds`, `refundFunds` çağrısı benzersiz ve deterministik key taşımalı.  
Format: `{action}-{entityId}-{timestamp}` veya `{action}-{entityId}-{actorId}`  
Deterministik key: aynı işlem tekrar çağrılırsa aynı key → idempotent sonuç (çift işlem yok)  
Rastgele key: her retry farklı key → çift hold/release → kullanıcı parasının çift çekilmesi

**gRPC bağlantı yönetimi:**

- gRPC channel `ClientGrpcModule` ile yönetilmeli
- Connection pool boyutu konfigüre edilebilir olmalı
- `keepalive` ping ayarları prod ortamında zorunlu (uzun süreli bağlantı kesilmesi önlenir)
- gRPC deadline/timeout her çağrıda set edilmeli (sonsuz bekleme → thread leak)

### Wallet İş Kuralları

```
Topup (para yükleme):
  - Iyzico başarılı callback'ten sonra tetiklenir (doğrudan topup yasak)
  - Minimum tutar: 10 ₺
  - Maximum günlük topup: konfigüre edilebilir (default: 50.000 ₺)
  - Çift topup koruması: Iyzico conversationId ile idempotent

Withdraw (çekim):
  - IBAN doğrulaması zorunlu (Türkiye IBAN formatı: TR + 24 rakam)
  - Minimum çekim: 50 ₺
  - Maximum günlük çekim: konfigüre edilebilir (default: 100.000 ₺)
  - Onay süreci: admin onayı veya otomatik (threshold'a göre)
  - KYC seviyesine göre limit farklılaşabilir
  - Çekim anında bakiye freeze (çekim onaylanana kadar bakiye kullanılamaz)

Bakiye tipleri:
  available: kullanılabilir bakiye
  frozen: escrow hold veya çekim bekleyen
  total: available + frozen
```

### Withdrawal Güvenlik Kuralları

```
- Günde max 1 IBAN değişikliği (kötüye kullanım önlemi)
- IBAN değişikliğinden sonra 24 saat bekleme (yeni IBAN'a çekim yapılamaz)
- Şüpheli işlem tespiti: kısa sürede çok sayıda küçük çekim → freeze + admin alert
- Admin override: hesabı dondur/aktif et
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya yolu + satır.

**1.1 gRPC client yapılandırması:**

- `WalletGrpcService` ve `EscrowGrpcService` `ClientGrpcModule` ile mi, yoksa manuel `new Client()` ile mi oluşturuluyor?
- gRPC channel'ın tek instance'ı mı var yoksa her çağrıda yeni channel mı açılıyor? (Her çağrıda yeni channel: connection leak, latency artışı)
- `deadline` / `timeout` her gRPC çağrısında set ediliyor mu? Set edilmiyorsa nerede olması gerektiğini göster.
- `keepalive` ping parametreleri var mı? (`keepaliveTimeMs`, `keepaliveTimeoutMs`)

**1.2 `financial-gateway.service.ts` orchestration analizi:**

- Bu servis orchestration mu yapıyor yoksa doğrudan gRPC client mi çağırıyor? (Orchestration: birden fazla gRPC çağrısını koordine eder; doğrudan çağrı: thin wrapper'dan farklı değil)
- Compensating logic var mı? `holdFunds` başarılı, sonraki adım başarısız → `refundFunds` tetikleniyor mu?
- Bu servis CommandBus/QueryBus üzerinden mi çağrılıyor yoksa controller'dan doğrudan inject mi ediliyor? (Doğrudan inject: handler katmanı bypass)

**1.3 financial-service iç yapısı:**

- Cüzdan bakiyesi nerede saklanıyor? MongoDB koleksiyonu adı ve schema'sı ne?
- Escrow hold'lar ayrı koleksiyonda mı, cüzdan embedded'inde mi?
- `holdFunds` atomic mi? Aynı anda iki eş zamanlı `holdFunds` çağrısında race condition oluşur mu? (MongoDB `findOneAndUpdate` + `$inc` ile atomic olmalı — kontrol et)
- `financial-service` kendi MongoDB instance'ını mı kullanıyor, backend ile paylaşıyor mu? (Paylaşılan instance: data isolation ihlali)

**1.4 idempotencyKey yönetimi:**

- Key üretimi nerede yapılıyor — gateway'de mi, handler'da mı, service'te mi?
- Key formatı tutarlı mı? Tüm `holdFunds` çağrılarında aynı format mı kullanılıyor?
- `resolve-dispute.handler.ts`'te deterministik key var (düzeltildi): `resolve-{sessionId}-{result}` — bu pattern diğer handler'lara taşınmış mı?
- Checkout'taki `holdFunds` key'i ile TicariTakas'taki `holdFunds` key'i çakışabilir mi? (entityId tipini prefix'e dahil et: `checkout-holdFunds-{orderId}` vs `barter-holdFunds-{sessionId}`)

**1.5 Modül bağımlılık grafiği:**

- `financial-gateway.module.ts` import listesi — hangi modüllere bağımlı?
- `financial-gateway` `global: true` mi? Global modül olmaması gerekir — her modülün açıkça import etmesi daha güvenli.
- `commerce.module.ts`, `barter.module.ts`, `ecosystem.module.ts` nasıl `EscrowGrpcService`'e erişiyor? Doğrudan import mu, re-export mu?

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Her iki konumu tara:

```bash
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/financial-gateway/ \
  apps/financial-service/src/ \
  --include="*.ts" \
  | grep -v "\.spec\.\|// eslint-disable\|\.d\.ts"
```

**Adım 2:** Her bulgu için tablo:

| Lokasyon | Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|---|
| gateway | escrow-grpc.service.ts | 34 | `response: any` | KRİTİK | `HoldFundsResponse` |

Risk seviyeleri:
- `KRİTİK`: Para tutarında `any` — Decimal128 vs number karışıklığı, holdId yanlış parse → çift ödeme
- `YÜKSEK`: gRPC response `any` → `holdId` undefined olabilir, escrow serbest bırakılamaz
- `ORTA`: Request DTO `any` → validation atlıyor
- `DÜŞÜK`: İzole scope, para akışını etkilemiyor

**Adım 3:** gRPC mesaj tipleri için — `.proto` dosyasından TypeScript interface'leri türet:

```typescript
// Proto tanımından türetilen tipler (proto'yu oku, kodu yaz):

interface HoldFundsRequest {
  userId: string;
  amount: string;          // Decimal128 → string (proto string olarak taşır)
  currency: string;        // 'TRY'
  idempotencyKey: string;
  description?: string;
}

interface HoldFundsResponse {
  holdId: string;
  frozenAmount: string;    // string → Decimal128'e çevrilecek
  status: 'HELD' | 'FAILED' | 'DUPLICATE';
  // DUPLICATE: aynı idempotencyKey ile tekrar çağrı → mevcut hold döner
}

interface ReleaseFundsRequest {
  holdId: string;          // field=1
  idempotencyKey: string;  // field=2 — DİKKAT: düzeltilmiş sıra
  recipientUserId: string;
}

interface RefundFundsRequest {
  holdId: string;          // field=1
  idempotencyKey: string;  // field=2
  reason?: string;
}

interface WalletBalanceResponse {
  available: string;       // string → Decimal128
  frozen: string;
  total: string;
  currency: string;
}
```

Bu tipler mevcut değilse yaz. Mevcutsa `any` ile karşılaştır.

**Adım 4:** Decimal128 ↔ string dönüşüm noktaları:

gRPC string olarak para taşır, backend Decimal128 kullanır. Bu dönüşüm nerede yapılıyor?

```typescript
// Doğru dönüşüm pattern:
// gRPC'den alırken:
const amount = Decimal128.fromString(response.amount);

// gRPC'ye gönderirken:
const amountStr = amount.toString();
```

`parseFloat()` veya `Number()` ile dönüşüm varsa → KRİTİK (floating point kayıp).  
Her dönüşüm noktasını bul ve raporla.

**Adım 5:** Topup callback handler'ında Iyzico response tipi:

Iyzico 3D Secure callback `req.body` olarak gelir. `any` kullanımı → para tutarının yanlış parse edilmesi riski:

```typescript
// Doğru:
interface IyzicoCallbackPayload {
  conversationId: string;
  paymentId: string;
  status: 'success' | 'failure';
  paidPrice: string;       // string — parseFloat değil, Decimal128.fromString
  currency: string;
}
```

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti:**

**Pattern A — İşlem tipine göre dallanma:**
```typescript
// Kötü — gateway.service.ts'de:
if (transactionType === 'TOPUP') {
  await this.walletGrpc.topup(...);
} else if (transactionType === 'WITHDRAW') {
  await this.walletGrpc.withdraw(...);
} else if (transactionType === 'HOLD') {
  await this.escrowGrpc.holdFunds(...);
}
// → Command pattern ile nasıl çözülür? Kodu yaz.
```

**Pattern B — Withdrawal limit kontrolü:**
```typescript
// Kötü — doğrudan if/else:
if (amount < 50) { throw ... }
else if (amount > 100000) { throw ... }
else if (dailyTotal + amount > dailyLimit) { throw ... }
// → Validator sınıfı nasıl extract edilir? Kodu yaz.
```

**Pattern C — gRPC hata kodu dallanması:**
```typescript
// Kötü — magic number:
if (err.code === 2) { ... }   // UNKNOWN
else if (err.code === 14) { ... }  // UNAVAILABLE
else if (err.code === 6) { ... }   // ALREADY_EXISTS (idempotent response)
// → gRPC StatusCode enum ve typed error handler nasıl kullanılır? Kodu yaz.
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti — para işlemlerinde sıfır tolerans:**

**Antipattern A — gRPC çağrısında sessiz yutma (KRİTİK):**
```typescript
// Kötü:
try {
  await this.escrowGrpc.holdFunds(request);
} catch (e) {
  // boş — para bloke edilmedi ama Order oluştu → ödenmemiş sipariş
}
```

**Antipattern B — Decimal parse'ta hata yutma:**
```typescript
// Kötü:
try {
  amount = Decimal128.fromString(rawAmount);
} catch {
  amount = Decimal128.fromString('0'); // para 0 olarak işlendi!
}
```

**Antipattern C — Compensating rollback eksikliği:**
```typescript
// Kötü — compensating action'da hata yutulursa:
try {
  await this.escrowGrpc.holdFunds(initiatorReq);
  await this.escrowGrpc.holdFunds(receiverReq); // başarısız
} catch {
  await this.escrowGrpc.refundFunds(initiatorHoldId); // bu da başarısız olursa?
  // → Para askıda kalır
}

// Doğru pattern:
const refundResult = await this.escrowGrpc.refundFunds(initiatorHoldId)
  .catch(refundErr => {
    this.logger.error('Compensating refund failed — manual intervention required', {
      initiatorHoldId,
      originalError: err.message,
      refundError: refundErr.message,
    });
    // Alert at: admin notification, PagerDuty, vb.
    return null; // hata yut ama log'a yaz
  });
```

**Antipattern D — gRPC timeout'ta generic rethrow:**
```typescript
// Kötü:
} catch (err) {
  throw new Error('gRPC failed'); // orijinal gRPC StatusCode kayboldu
}
// Doğru:
} catch (err: unknown) {
  if (isGrpcError(err)) {
    throw new GrpcException(err.code, err.message, { originalError: err });
  }
  throw err;
}
```

**Antipattern E — Idempotency olmayan retry:**
```typescript
// Kötü — retry'da yeni key üretilirse:
for (let i = 0; i < 3; i++) {
  try {
    await holdFunds({ idempotencyKey: `hold-${Date.now()}` }); // Her retry farklı key
    break;
  } catch { continue; }
}
// → Çift hold riski. Doğru: key retry'da değişmemeli.
```

Her bulgu için: dosya + satır, antipattern türü, doğru implementasyon.

**3.3 Withdrawal akışı güvenlik analizi:**

```
Şunları kontrol et:

1. IBAN doğrulama nerede yapılıyor?
   Controller'da mı (validation pipe)?
   Handler'da mı?
   financial-service'de mi?
   → En az iki yerde olmalı: DTO validation + domain rule

2. Günlük çekim limiti nasıl hesaplanıyor?
   Redis'te mi tutuluyor (önerilen)?
   MongoDB aggregate mi?
   Her ikisi de yoksa: concurrent çekim isteğinde race condition

3. IBAN değişikliği 24 saat bekleme:
   Bu kural implement edilmiş mi?
   Yoksa kullanıcı IBAN'ı değiştirip anında çekiyor → fraud riski

4. Çekim onay akışı:
   Admin onayı threshold'u var mı?
   Büyük çekimler (örn: 10.000₺ üstü) admin onayına mı takılıyor?
   Otomatik onay hangi tutara kadar?
```

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Dosya envanteri — gerçek durumu raporla:**

| Dosya | Beklenen Görev | Gerçek İçerik | Durum |
|---|---|---|---|
| `financial-gateway.service.ts` | gRPC orchestration | ? | ? |
| `wallet-grpc.service.ts` | Wallet gRPC client | ? | ? |
| `escrow-grpc.service.ts` | Escrow gRPC client | ? | ? |
| `wallet.controller.ts` | HTTP → gateway | ? | ? |
| `wallet-admin.controller.ts` | Admin HTTP | ? | ? |
| `financial-service/` her dosya | Gerçek bakiye/escrow | ? | ? |

**4.2 Thin wrapper tespiti:**

`financial-gateway.service.ts` sadece gRPC çağrısını forward eden thin wrapper mı?

```typescript
// Thin wrapper (gereksiz katman):
async holdFunds(request: HoldFundsRequest) {
  return this.escrowGrpc.holdFunds(request); // doğrudan forward
}

// Değer katan orchestration (gerekli katman):
async holdFunds(request: HoldFundsRequest) {
  this.validateIdempotencyKey(request.idempotencyKey);
  const result = await this.escrowGrpc.holdFunds(request);
  await this.auditLog.record('HOLD', request, result);
  return result;
}
```

Eğer sadece forward yapıyorsa: bu katmanı kaldır, doğrudan `EscrowGrpcService`'i inject et.  
Eğer orchestration yapıyorsa: iyi tasarım — koru.

**4.3 Duplicate idempotencyKey üretimi:**

`holdFunds` çağrısından önce key üretilen her yer:

```bash
grep -rn "idempotencyKey\|idempotency_key" \
  apps/backend/src/ apps/financial-service/src/ \
  --include="*.ts"
```

Her occurrence için:
- Deterministik mi (aynı entity için hep aynı key)?
- Formatı tutarlı mı?
- Prefix çakışma riski var mı?

Tutarsız olanlar için unified `IdempotencyKeyFactory` yaz:

```typescript
export class IdempotencyKeyFactory {
  static forEscrowHold(context: 'checkout' | 'barter' | 'barter-teminat', entityId: string): string {
    return `${context}-hold-${entityId}`;
  }
  static forEscrowRelease(context: string, holdId: string): string {
    return `${context}-release-${holdId}`;
  }
  static forEscrowRefund(context: string, holdId: string): string {
    return `${context}-refund-${holdId}`;
  }
}
```

**4.4 Dead code tespiti:**

```bash
grep -rn "^export" \
  apps/backend/src/modules/financial-gateway/ \
  apps/financial-service/src/ \
  --include="*.ts" | \
  grep -oP '(?<=class |function |const |interface )\w+' | \
  while read name; do
    refs=$(grep -rn "\b$name\b" apps/backend/src/ apps/financial-service/src/ \
      --include="*.ts" | wc -l)
    [ "$refs" -le 1 ] && echo "POSSIBLE DEAD: $name"
  done
```

**4.5 financial-service şişkinlik analizi:**

- Cüzdan bakiyesi ve escrow aynı service class'ta mı? Ayrılmalı mı?
- Transaction history kaçıncı satıra kadar büyüyor? Pagination implement edilmiş mi?
- Audit log ayrı servis mi, embedded mi? (Ayrı olmalı — fintech standart)

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Lokasyon:** `apps/.../file.ts:satır`
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

1. **KRİTİK** — Çift hold/release, floating-point para kaybı, sessiz gRPC hata yutma, idempotency açığı
2. **YÜKSEK** — gRPC timeout yönetimi eksik, withdrawal güvenlik kuralları uygulanmıyor
3. **ORTA** — Thin wrapper katmanı, duplicate key üretimi, tip tutarsızlıkları
4. **DÜŞÜK** — Naming, dead code, minor refactor

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- **gRPC field numaraları** — `holdId=1, idempotencyKey=2` sırası düzeltilmiş, bozma
- **Proto mesaj isimleri** — değişiklik wire format'ı bozar
- **Iyzico entegrasyon kodu** — ödeme gateway değişmez
- **Decimal128 kullanımı** — zaten doğru, bozma
- **MongoDB replica set gerekliliği** — transaction için zorunlu, kaldırma önerme
- **financial-service'in ayrı process olarak çalışması** — monolith'e merge önerme
- **Withdrawal onay threshold değerleri** — iş kararı, konfigüre edilebilir yap ama değerleri değiştirme

---

## Son Not

Para işlemlerinde sıfır tolerans:

gRPC'de boş catch → para bloklansın veya serbest bırakılmasın, kimse fark etmez.  
`parseFloat()` ile para parse → kuruş kayıpları birikir, KDV hesabı yanlışlaşır.  
Rastgele idempotencyKey → retry'da çift hold → kullanıcı cüzdanından fazla para çekilir.  
gRPC timeout set edilmemiş → request askıda kalır, thread pool dolar, servis yanıtsız olur.  

Bunların hepsi production'da finansal kayıp ve düzenleyici risk demektir.
