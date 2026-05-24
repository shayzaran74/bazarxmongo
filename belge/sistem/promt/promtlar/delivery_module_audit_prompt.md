# Delivery Modülü — Derinlemesine İnceleme & Refactoring Görevi

## Sen Kimsin

Bu projenin baş mimarısın. Delivery sistemini oluştururken aldığın kararları biliyorsun: neden ayrı microservice seçildi, neden BullMQ polling eklendi, `DeliveryDispatch` neden backend içinde tutuldu. Şimdi geri dönüp sistemi eleştirel gözle değerlendiriyorsun. Tahmin yürütme. Her tespit dosya yolu ve satır referansı taşısın. "Belki" ve "genellikle" kullanma — tespitlerini doğrudan ifade et.

---

## Sistem Bağlamı

**Monorepo yapısı:**
```
apps/
  backend/              NestJS, port 3001 — içinde delivery/ modülü var
    src/modules/
      delivery/         DeliveryDispatch: kargo etiket ve dispatcher koordinasyon
  delivery-service/     Ayrı NestJS microservice, port 3003
                        Kargo takip, CargoProvider adapter'ları, polling
packages/
  shared-messaging/     RabbitMQ modülü
  shared-queue/         BullMQ tanımları
  shared-core/          Result<T>, Entity base, Value Object base
```

**Stack:** NestJS + DDD/CQRS/Hexagonal · MongoDB + Mongoose · RabbitMQ · BullMQ  
**Pattern kuralları:**
- Controller → CommandBus/QueryBus → Handler → Repository
- Para: `Decimal128` (number yasak)
- Log: `Logger` (console.* yasak)
- Tip: strict TypeScript (any yasak)
- Business logic: domain entity'de

---

## İki Katmanı Birden İncele

### Katman 1 — `apps/backend/src/modules/delivery/`

BazarX-GO Faz 4'te oluşturuldu. Şunları içeriyor:
- `DeliveryDispatch` Mongoose schema (`orderId`, `courierId`, `status: DispatchStatus`)
- `DispatchStatus` enum
- Handler'lar ve controller
- `POST /orders/:id/dispatch` endpoint'i
- BullMQ `DELIVERY_DISPATCH_QUEUE`
- `DispatchNotificationProcessor` — **stub, gerçek bildirim (SMS/Push) yok**

**Bağlam:** Bu modül GO restoranları ve kendi teslimat servisi olan vendor'lar için. E-ticaret kargo takibi burada değil — `delivery-service`'de.

### Katman 2 — `apps/delivery-service/`

Ayrı NestJS microservice. Kargo takip motoru. Şunları içermesi bekleniyor:
- `ICargoProvider` interface + adapter'lar (MNG, Yurtiçi, Sürat, TEX)
- `CargoShipment`, `CargoStatusHistory`, `CargoProvider` Mongoose schema'ları
- `CargoPollingScheduler` — BullMQ repeatable job, 2 saatte bir
- `CargoWebhookController` — webhook destekleyen firmalar için
- Durum değişikliğinde RabbitMQ event → push/SMS bildirimi

**Kargo state machine:**
```
LABEL_CREATED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED / FAILED
```

**Durum:** `PROJE_DURUMU.md`'de `[ ]` (tamamlanmadı) olarak işaretli. Bu neyin implement edildiğini, neyin stub kaldığını bilmiyoruz — kodu okuyarak öğreneceksin.

---

## İş Kuralları — Bunları Bilmeden İnceleme Yapma

**DeliveryType sınıflandırması (Order'a bağlı):**
```typescript
enum DeliveryType {
  CARGO = 'CARGO',           // Standart kargo — delivery-service takip eder
  LOCAL_COURIER = 'LOCAL_COURIER', // Restoran/vendor kendi kuryesi — DeliveryDispatch modülü
  PICKUP = 'PICKUP',         // GO: kullanıcı restorana gider — kargo yok
}
```

**Her DeliveryType için farklı iş akışı:**
```
CARGO:
  Order SHIPPED → CargoShipment oluştur → CargoProvider'a label isteği
  → Polling veya webhook ile durum güncelle
  → DELIVERED olunca: escrow release + fatura

LOCAL_COURIER:
  Order READY → POST /orders/:id/dispatch → DeliveryDispatch oluştur
  → Kurye atanır (DispatchStatus: PENDING_ASSIGN → ASSIGNED → PICKED_UP → DELIVERED)
  → DispatchNotificationProcessor: kurye ve müşteriye bildirim

PICKUP (GO QR_PICKUP):
  DeliveryDispatch yok, CargoShipment yok
  → QR taranınca REDEEMED → COMPLETED
```

**Polling kuralları:**
```
- Webhook destekleyen firmalar (aşamalı): gerçek zamanlı durum güncellemesi
- Webhook desteklemeyen firmalar: BullMQ repeatable job, 2 saatte bir polling
- Polling başarısız olursa: exponential backoff, max 3 retry
- 3 retry sonrası hâlâ başarısız: admin alert + CargoShipment.status = POLLING_FAILED
```

**Kargo firma adapter kuralları:**
```
Her ICargoProvider implementasyonu şunları yapmak zorunda:
  - createLabel(shipmentData): Promise<CargoLabelResult>
  - getStatus(trackingCode: string): Promise<CargoStatusResult>
  - cancelShipment(trackingCode: string): Promise<void>

Firma bazlı auth (API key/secret): CargoProvider koleksiyonunda şifreli tutulmalı
Her API çağrısı idempotent olmalı — tekrar çağrıda aynı sonucu versin
```

**RabbitMQ event akışı:**
```
backend → [order.shipped] → delivery-service
  delivery-service → [cargo.status.updated] → backend
    backend → [notification.send] → notification service (veya FCM/SMS doğrudan)
```

**GO isGoOrder flag kuralı:**
```typescript
// isGoOrder=true olan siparişler için:
// DeliveryType === 'PICKUP' → DeliveryDispatch oluşturma
// DeliveryType === 'LOCAL_COURIER' → DeliveryDispatch oluştur (restoran kendi kuryesi)
// DeliveryType === 'CARGO' → CargoShipment oluştur (nadir — GO'da çoğu PICKUP)
```

---

## Görevin 4 Bölümü

---

### BÖLÜM 1 — Mimari Haritalama

Her soruyu **kod okuyarak** yanıtla. Kanıt: dosya + satır.

**1.1 İki katman arasındaki gerçek sınır:**

- `backend/delivery/` ve `delivery-service/` arasında hangi iletişim kanalı kullanılıyor? RabbitMQ mu, gRPC mi, HTTP mu, hiçbiri mi?
- `backend` `delivery-service`'e doğrudan HTTP çağrısı yapıyor mu? Yapıyorsa bu anti-pattern — hangi handler veya service'te?
- `delivery-service` `backend`'e callback yapıyor mu? Nasıl?
- İki servis aynı MongoDB instance'ını mı kullanıyor (anti-pattern), yoksa ayrı database'ler mi?

**1.2 DeliveryDispatch modülünün gerçek durumu:**

- `DispatchNotificationProcessor` — body gerçekten stub mu? `throw new NotImplementedException()` mu, yoksa bir şeyler implement edilmiş mi?
- `POST /orders/:id/dispatch` handler'ı — tüm DeliveryType'lar için mi çalışıyor, yoksa sadece LOCAL_COURIER için mi? PICKUP siparişine `dispatch` çağrılırsa ne oluyor?
- `DeliveryDispatch` schema'sında `courierId` var — courier assignment akışı var mı? Yoksa sadece field tanımlanmış, assignment logic yok mu?
- `delivery.module.ts` `commerce.module.ts`'e export ediyor mu? Olmak zorunda çünkü checkout `deliveryType`'a bakıyor.

**1.3 delivery-service iç yapısı:**

- `ICargoProvider` interface tanımlı mı yoksa sadece MAP'te mi var?
- Kaç firma adapter'ı implement edilmiş? (MNG, Yurtiçi, Sürat, TEX — hangisi gerçek, hangisi stub?)
- `CargoPollingScheduler` gerçekten BullMQ repeatable job mı, yoksa `@Cron` ile yazılmış mı? (BullMQ repeatable daha sağlıklı — `@Cron` multi-instance'da çakışır)
- `CargoWebhookController` webhook signature validation yapıyor mu? Her firma farklı HMAC/secret kullanır — bunu kontrol et.
- `delivery-service` kendi `main.ts`'i var mı? Docker container'ı ayrı mı?

**1.4 RabbitMQ event akışı gerçek mi:**

- `order.shipped` event'i backend'den publish ediliyor mu? Nerede?
- `delivery-service`'de `order.shipped` consumer var mı?
- `cargo.status.updated` event'i `delivery-service`'den publish ediliyor mu?
- Backend'de `cargo.status.updated` consumer var mı? Varsa `Order.status`'u ne zaman `DELIVERED`'a geçiriyor?

**1.5 Modül bağımlılık grafiği:**

- `delivery.module.ts` (backend içi) ve `delivery-service/app.module.ts` — her ikisinin import listesini çıkar
- `commerce.module.ts` → `delivery.module.ts` bağımlılığı tek yönlü mü?
- `shared-queue` `DELIVERY_DISPATCH_QUEUE` tanımı iki servis tarafından da import ediliyor mu? (Tutarlılık için zorunlu)

---

### BÖLÜM 2 — Type Safety & `any` Denetimi

**Adım 1:** Her iki konumu tara:

```bash
# Backend delivery modülü:
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/backend/src/modules/delivery/ \
  --include="*.ts" | grep -v "\.spec\.\|// eslint-disable"

# delivery-service:
grep -rn ": any\|as any\|<any>\| any[,;)\s]" \
  apps/delivery-service/src/ \
  --include="*.ts" | grep -v "\.spec\.\|// eslint-disable"
```

**Adım 2:** Her bulgu için tablo:

| Lokasyon | Dosya | Satır | Bağlam | Risk | Doğru Tip |
|---|---|---|---|---|---|
| delivery-service | cargo-provider.interface.ts | 14 | `response: any` | KRİTİK | `CargoStatusResult` |

Risk seviyeleri:
- `KRİTİK`: Kargo durumu yanlış parse → `Order.status` yanlış geçiş → escrow yanlış release
- `YÜKSEK`: Webhook payload `any` → firma imzası validate edilemiyor → güvenlik açığı
- `ORTA`: Response shape belirsiz → tip mismatch runtime'da
- `DÜŞÜK`: İzole scope, cascade riski yok

**Adım 3:** Kargo firma adapter'larında özellikle ara:

Her `ICargoProvider` implementasyonunda API response'u nasıl parse ediliyor? `any` varsa KRİTİK — kargo firması format değiştirirse sessizce yanlış durum yazılır:

```typescript
// Kötü:
const response = await axios.get(url);
const status = response.data as any; // KRİTİK

// Doğru:
interface MngStatusResponse {
  ShipmentStatus: 'DELIVERED' | 'IN_TRANSIT' | 'FAILED';
  StatusDate: string;
  Description: string;
}
const response = await axios.get<MngStatusResponse>(url);
```

Her firma için doğru tip tanımını yaz.

**Adım 4:** RabbitMQ message payload tipleri:

`order.shipped` ve `cargo.status.updated` event payload'larının tipleri tanımlı mı? `any` varsa:

```typescript
// Doğru tip tanımı:
interface OrderShippedEvent {
  orderId: string;
  vendorId: string;
  trackingCode: string;
  cargoProvider: 'MNG' | 'YURTICI' | 'SURAT' | 'TEX';
  shippedAt: Date;
  deliveryType: 'CARGO' | 'LOCAL_COURIER';
}

interface CargoStatusUpdatedEvent {
  orderId: string;
  trackingCode: string;
  previousStatus: CargoStatus;
  newStatus: CargoStatus;
  updatedAt: Date;
  rawProviderResponse?: string; // debug için, opsiyonel
}
```

---

### BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

**3.1 if/else zinciri tespiti — delivery'ye özgü:**

**Pattern A — DeliveryType dallanması:**
```typescript
// Kötü — handler veya service'de:
if (order.deliveryType === 'CARGO') {
  await this.cargoService.createShipment(order);
} else if (order.deliveryType === 'LOCAL_COURIER') {
  await this.dispatchService.createDispatch(order);
} else if (order.deliveryType === 'PICKUP') {
  // hiçbir şey yapma
}
// → Strategy pattern ile nasıl çözülür? Kodu yaz.
```

**Pattern B — DispatchStatus dallanması:**
```typescript
// Kötü:
if (dispatch.status === 'PENDING_ASSIGN') { ... }
else if (dispatch.status === 'ASSIGNED') { ... }
else if (dispatch.status === 'PICKED_UP') { ... }
// → State machine ile nasıl çözülür? Kodu yaz.
```

**Pattern C — Kargo firması dallanması:**
```typescript
// Kötü — adapter seçiminde:
if (provider === 'MNG') { return new MngAdapter(); }
else if (provider === 'YURTICI') { return new YurticiAdapter(); }
// → Factory pattern ile nasıl çözülür? Kodu yaz.
```

Her bulgu için: dosya + satır, dal sayısı, refactor kodu.

**3.2 try/catch antipattern tespiti — delivery'ye özgü risk:**

**Antipattern A — Polling'de sessiz yutma (en tehlikeli):**
```typescript
// Kötü — polling scheduler'da:
async pollCargoStatus(trackingCode: string) {
  try {
    const status = await provider.getStatus(trackingCode);
    await this.updateStatus(status);
  } catch (e) {
    // boş — kargo durumu güncellenmedi, sipariş SHIPPED'ta kaldı sonsuza dek
  }
}
// → Retry logic + POLLING_FAILED state + admin alert nasıl eklenir? Kodu yaz.
```

**Antipattern B — Webhook doğrulamada hata yutma:**
```typescript
// Kötü:
try {
  const signature = req.headers['x-mng-signature'];
  verifyHmac(signature, req.body);
} catch {
  // imza geçersiz ama işleme devam et — güvenlik açığı
}
```

**Antipattern C — Dispatcher retry'sız gönderim:**
```typescript
// Kötü:
await this.notificationQueue.add('DISPATCH_NOTIFICATION', payload);
// BullMQ job başarısız olursa retry policy tanımlı mı?
// defaultJobOptions'da attempts ve backoff var mı?
```

**Antipattern D — Kargo iptal race condition:**
```typescript
// Kötü — iki eş zamanlı iptal isteği:
const dispatch = await repo.findById(id);
if (dispatch.status === 'PENDING_ASSIGN') {
  await repo.update(id, { status: 'CANCELLED' });
}
// → Atomic findOneAndUpdate ile nasıl düzeltilir?
```

Her bulgu için: dosya + satır, antipattern türü, doğru implementasyon.

**3.3 Polling scheduler'ın doğruluk analizi:**

```
Şunu kontrol et:
1. Scheduler multi-instance'da çakışıyor mu?
   @Cron kullanıyorsa → BullMQ repeatable job'a geçirme önerisi yaz
   BullMQ repeatable kullanıyorsa → lock mekanizması var mı?

2. Hangi shipment'lar poll ediliyor?
   Tüm SHIPPED siparişler mi? (verimsiz)
   Sadece son N saatte güncellenen mi? (doğru)
   Sorgu index'i var mı? { status: 1, lastPolledAt: 1 }

3. Exponential backoff implement edilmiş mi?
   attempts: 3, backoff: { type: 'exponential', delay: 5000 }
   Son retry başarısız → status: 'POLLING_FAILED' + admin event

4. Polling sıklığı konfigüre edilebilir mi?
   Sabit 2 saat mi, admin panelinden değiştirilebilir mi?
```

**3.4 Webhook güvenlik analizi:**

`CargoWebhookController`'da şunları kontrol et:

```
1. Her firma için ayrı HMAC key'i var mı?
2. Timestamp replay attack koruması var mı?
   (5 dakikadan eski webhook reject edilmeli)
3. Webhook body tam olarak parse edilmeden önce imza doğrulanıyor mu?
   (Sıra önemli: önce imza, sonra parse)
4. Aynı webhook iki kez gelirse idempotent mi?
   (trackingCode + timestamp composite key ile deduplicate)
```

---

### BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

**4.1 Stub dosyaları envanteri — gerçek durumu raporla:**

| Dosya | Beklenen İçerik | Gerçek Durum |
|---|---|---|
| `DispatchNotificationProcessor` | SMS/Push gönderimi | ? |
| `MngCargoAdapter` | MNG API entegrasyonu | ? |
| `YurticiCargoAdapter` | Yurtiçi API | ? |
| `SuratCargoAdapter` | Sürat Kargo API | ? |
| `TexCargoAdapter` | TEX API | ? |
| `CargoWebhookController` | Webhook handling | ? |
| `CargoPollingScheduler` | BullMQ repeatable | ? |

Her stub için karar:
- **Koru (stub):** Module'da register, routing var → `throw new NotImplementedException()` ile doğru hata dön
- **Kaldır:** Register da edilmemiş, hiçbir referans yok → sil
- **Kritik:** Boot'ta injection crash yapıyor → hemen düzelt

**4.2 Dead code tespiti:**

```bash
# delivery-service içinde kullanılmayan export'lar:
grep -rn "^export" apps/delivery-service/src/ --include="*.ts" | \
  while IFS=: read file line export; do
    name=$(echo "$export" | grep -oP '(?<=class |function |const |interface )\w+' | head -1)
    [ -z "$name" ] && continue
    refs=$(grep -rn "\b$name\b" apps/delivery-service/src/ apps/backend/src/ \
      --include="*.ts" | grep -v "^$file:" | wc -l)
    [ "$refs" -eq 0 ] && echo "DEAD [$file:$line]: $name"
  done
```

**4.3 Duplicate kargo durum mapping:**

Kargo firmaları farklı status string'leri döner. Bu mapping birden fazla yerde yapılıyorsa (her adapter'da ayrı ayrı) → merkezi `CargoStatusMapper` service'ine taşı:

```typescript
// Kötü — MngAdapter'da:
if (apiStatus === 'TESLİM EDİLDİ') return CargoStatus.DELIVERED;

// Kötü — YurticiAdapter'da:
if (apiStatus === 'DELIVERED') return CargoStatus.DELIVERED;

// Doğru — CargoStatusMapper'da:
export class CargoStatusMapper {
  static map(provider: CargoProviderType, rawStatus: string): CargoStatus {
    return PROVIDER_STATUS_MAP[provider][rawStatus] ?? CargoStatus.UNKNOWN;
  }
}
const PROVIDER_STATUS_MAP: Record<CargoProviderType, Record<string, CargoStatus>> = {
  MNG: { 'TESLİM EDİLDİ': CargoStatus.DELIVERED, ... },
  YURTICI: { 'DELIVERED': CargoStatus.DELIVERED, ... },
};
```

**4.4 `delivery-service` konfigürasyon analizi:**

- Her kargo firmasının API endpoint'i ve key'i nerede tutuluyor? `.env`'de mi, MongoDB `CargoProvider` koleksiyonunda mı, hard-code mu?
- Hard-code varsa: konfigürasyon dışa çıkarma önerisi yaz
- `CargoProvider` koleksiyonu varsa: admin panelinden enable/disable yapılabiliyor mu?

**4.5 Mongoose model gereksiz field analizi:**

`DeliveryDispatch` ve `CargoShipment` schema'larında:

- `DeliveryDispatch.courierId` — courier assignment akışı yoksa bu field ölü. Kanıtla.
- `CargoStatusHistory` ayrı koleksiyon mu, `CargoShipment` içinde embedded array mı? Hangisi:
  - Ayrı koleksiyon: büyük sipariş hacminde daha iyi (unbounded array sorunu yok)
  - Embedded: basit sorgular için yeterli, compound index gereksinimi az
  - Mevcut yapı hangisi, doğru seçim hangisi — argümanını yaz.

---

## Çıktı Formatı

```
## [BÖLÜM X.Y] — [Başlık]

**Lokasyon:** `apps/.../file.ts:satır` (backend veya delivery-service)
**Tespit:** [Ne buldun]
**Risk:** KRİTİK / YÜKSEK / ORTA / DÜŞÜK
**Sorun:** [Neden sorun — tek cümle]

**Düzeltme:**
```typescript
// Tam, çalışır kod
```

**Cascade etkisi:** [Bu değişiklik başka neyi etkiler]
```

---

## Önceliklendirme

1. **KRİTİK** — Kargo durumu yanlış parse (escrow yanlış release riski), webhook imza bypass, polling sessiz hata yutma
2. **YÜKSEK** — Tip güvensizliği kargo API response'larında, stub processor'ların NestJS boot'ta crash yapması
3. **ORTA** — DeliveryType dallanması strategy'ye alınmalı, polling scheduler multi-instance güvenliği
4. **DÜŞÜK** — Dead code, naming, minor refactor

Her seviye için toplam bulgu sayısını belirt.

---

## Sınırlar — Bunlara Dokunma

- Kargo firma seçimi (MNG, Yurtiçi, Sürat, TEX) — iş kararı
- BullMQ polling sıklığı (2 saat) — iş kararı, konfigüre edilebilir olmasını öner ama değiştirme
- `DeliveryType` enum değerleri — commerce modülü bağımlı
- `DispatchStatus` enum değerleri — frontend bağımlı
- `isGoOrder` / `goOrderMode` field isimleri — GO sprint'te kararlaştırıldı
- Gerçek SMS/Push implementasyonu — `DispatchNotificationProcessor` stub kalabilir, sadece doğru exception fırlatsın
- `delivery-service` → `backend` RabbitMQ event yapısı — event isimlerini değiştirme, consumer olan taraf bozulur

---

## Son Not

Kargo firması API'sinden dönen `any` tip her sipariş için potansiyel escrow yanlış release'dir.  
Webhook imza validasyonu olmayan her endpoint sahte kargo bildirimi kabul eder.  
Polling'de sessiz catch bloğu olan her scheduler siparişleri sonsuza SHIPPED'ta bırakır.  
Stub processor'lar NestJS DI container'ına register edilmişse boot'ta crash yapar — bunu ilk kontrol et.
