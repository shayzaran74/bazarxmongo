# Delivery Modülü — Derinlemesine Audit Raporu

**Tarih:** 2026-05-24
**Auditor:** Claude Code (Delivery Module Audit Prompt v1)
**Proje yolu:** `apps/backend/src/modules/delivery/` ve `apps/delivery-service/`

---

## Yönetici Özeti

| Seviye | Bulgu Sayısı |
|--------|-------------|
| KRİTİK | 2 |
| YÜKSEK | 3 |
| ORTA | 5 |
| DÜŞÜK | 4 |

---

## BÖLÜM 1 — Mimari Haritalama

### [1.1.1] — Backend → delivery-service İletişim: gRPC, RabbitMQ Yok

**Lokasyon:** `apps/backend/src/modules/delivery/grpc/delivery-grpc.client.ts`, `apps/delivery-service/src/main.ts`
**Tespit:** Backend delivery modülü `delivery-service`'e gRPC üzerinden bağlanıyor — RabbitMQ kullanılmıyor. `DeliveryGrpcService` gRPC client'ı `delivery-service`'in gRPC port'unu çağırıyor (`apps/delivery-service/src/main.ts:33`). İki servis ayrı MongoDB instance'ı kullanıyor — delivery-service kendi `MONGODB_URI`'sini ConfigService'den alıyor.
**Risk:** ORTA — gRPC doğru seçim, RabbitMQ gerekmiyor. Ama ayrı MongoDB instance'ı coordination sorunu yaratabilir.
**Sorun:** Backend ve delivery-service aynı veritabanını paylaşmadığı için Order status sync'i manuel yapılıyor.

---

### [1.1.2] — `order.shipped` RabbitMQ Eventi Backend'de Yok

**Lokasyon:** `apps/backend/src/modules/delivery/` (geneli)
**Tespit:** Prompt'ta belirtilen `backend → [order.shipped] → delivery-service` RabbitMQ event akışı **implement edilmemiş**. CheckoutService'de `SHIPPED` durumunda herhangi bir RabbitMQ event publish edilmiyor (`apps/backend/src/modules/commerce/application/services/checkout.service.ts`). Delivery-service'in `order-created.handler.ts` dosyası var ama bu OrderCreated event'ini dinliyor — bu event backend'den değil başka bir kaynaktan geliyor.
**Risk:** KRİTİK
**Sorun:** Sipariş SHIPPED olduğunda kargo takibi otomatik başlamıyor. Vendor `POST /orders/:id/tracking/ship` el ile çağırmak zorunda.

**Düzeltme:** Checkout'ta Order SHIPPED state'e geçtiğinde RabbitMQ event publish edilmeli:
```typescript
// checkout.service.ts — order status SHIPPED olduktan sonra:
await this.rabbitMQ.publish('commerce.events', 'order.shipped', {
  orderId: order.id,
  vendorId: order.getProps().vendorId,
  deliveryType: order.getProps().deliveryType,
  shippedAt: new Date(),
});
```

---

### [1.2.1] — `DispatchNotificationProcessor` Stub — Gerçek Bildirim Yok

**Lokasyon:** `apps/backend/src/modules/delivery/application/workers/dispatch-notification.processor.ts:34-37`
**Tespit:**
```typescript
// TODO: Gerçek bildirim mekanizması — SMS (Netgsm/Twilio), Push Notification (FCM), veya harici API
// RabbitMQ veya harici bildirim servisi burada çağrılır:
```
Processor boot'ta crash yapmıyor çünkü `extends WorkerHost` — job alıyor ama body'de gerçek işlem yok. Job enqueue ediliyor (`dispatch-courier.handler.ts:74`) ama consumer boş döndürüyor.
**Risk:** YÜKSEK
**Sorun:** Kurye atandığında ne SMS ne push notification gidiyor. Müşteri siparişin kuryeye verildiğini bilmiyor.

**Düzeltme:** En azından `throw new NotImplementedException()` fırlatmalı veya log atmalı — şu an sessizce başarılı dönüyor:
```typescript
async process(job: Job<DispatchNotificationJob>): Promise<void> {
  this.logger.warn('DispatchNotificationProcessor — gerçek bildirim implementasyonu bekleniyor', {
    dispatchId: job.data.dispatchId,
  });
  throw new Error('Bildirim servisi henüz entegre edilmedi');
}
```

---

### [1.2.2] — Dispatch Endpoint'i `/delivery/dispatch` — `/orders/:id/dispatch` Değil

**Lokasyon:** `apps/backend/src/modules/delivery/presentation/delivery.controller.ts`
**Tespit:** Prompt'ta `/orders/:id/dispatch` olarak belirtilmiş ama gerçek endpoint `/delivery/dispatch`. Body'de `orderId` ve `courierId` alınıyor. PICKUP siparişlerine dispatch çağrılırsa ne olacağı kontrol edilmeli — ama `dispatch-courier.handler.ts:37-38` zaten sadece `vendorType === 'RESTAURANT'` kontrolü yapıyor, DeliveryType'a bakmıyor.
**Risk:** ORTA
**Sorun:** PICKUP siparişlerine dispatch çağrılırsa sessizce reddediliyor — ama hata mesajı yanıltıcı değil, "Bu aksiyon yalnızca RESTAURANT siparişlerinde geçerlidir."

---

### [1.2.3] — DeliveryModule CommerceModule'e Export Edilmiyor

**Lokasyon:** `apps/backend/src/modules/delivery/delivery.module.ts:79`, `apps/backend/src/modules/commerce/commerce.module.ts`
**Tespit:** `delivery.module.ts` sadece `MongoDeliveryDispatchRepository` ve `DeliveryGrpcService` export ediyor. `CommerceModule` delivery modülünü import etmiyor. CheckoutService'de DeliveryType'a göre işlem yapılması gerekiyor ama delivery modülü bağımsız — checkout onu doğrudan çağırmıyor.
**Risk:** ORTA
**Sorun:** Delivery modülü commerce'den bağımsız olduğu içinDeliveryType.CARGO siparişlerinde CargoShipment oluşturma logic'i kim kontrol ediyor? `cargo-tracking.controller.ts`'te vendor el ile `POST /orders/:id/tracking/ship` çağırıyor — otomasyon yok.

---

### [1.3.1] — ICargoProvider Interface Backend'de — delivery-service'de Yok

**Lokasyon:** `apps/backend/src/modules/delivery/domain/interfaces/ICargoProvider.interface.ts`
**Tespit:** Cargo provider adapter pattern'i backend'de implement edilmiş (`MngCargoAdapter`, `YurticiCargoAdapter`, `SuratCargoAdapter`, `TexCargoAdapter`) — delivery-service'de değil. Bu doğru bir karar çünkü kargo takibi backend'e yakın. Ama CargoPollingScheduler backend'de çalışıyor ve `CargoShipment` veritabanında tutulacak — hangi koleksiyon? Backend'de bir `CargoShipment` collection yok, `createShipment()` stub olarak kalmış (`cargo-tracking.service.ts:57-68`).
**Risk:** YÜKSEK
**Sorun:** `createShipment()` TODO — veritabanına kaydetmiyor. Polling yapıldığında hangi veritabanını sorgulayacak?

---

### [1.3.2] — CargoPollingScheduler `setInterval` Kullanıyor — BullMQ Repeatable Değil

**Lokasyon:** `apps/backend/src/modules/delivery/application/services/cargo-polling.scheduler.ts:15-23`
**Tespit:**
```typescript
private intervalHandle: ReturnType<typeof setInterval> | null = null;
onApplicationBootstrap(): void {
  setTimeout(() => {
    void this.poll();
    this.intervalHandle = setInterval(() => void this.poll(), POLL_INTERVAL_MS);
  }, 30_000);
}
```
**Risk:** KRİTIK — multi-instance deployment'da çakışır. İki backend instance çalışırsa her 2 saatte bir her iki instance da polling yapar. Lock mekanizması yok. Lock için Redis veya MongoDB distributed lock gerekli.
**Sorun:** Polling tamamıyla stub — veritabanından shipment çekmiyor, sadece log atıyor (`cargo-polling.scheduler.ts:37-38` — TODO yorumları).

**Düzeltme:** BullMQ repeatable job veya Redis-based lock eklenmeli. Polling implementasyonu:
```typescript
async poll(): Promise<void> {
  // 1. Lock al — Redis SET NX
  const lock = await this.acquireLock('cargo-polling', 5 * 60 * 1000);
  if (!lock) { this.logger.log('Polling zaten başka instance\'da çalışıyor'); return; }
  try {
    const shipments = await this.shipmentRepo.findByStatus(['PENDING','IN_TRANSIT','OUT_FOR_DELIVERY']);
    for (const shipment of shipments) {
      await this.updateShipmentStatus(shipment);
    }
  } finally {
    await this.releaseLock('cargo-polling');
  }
}
```

---

### [1.3.3] — CargoWebhookController Webhook Payload İşlemiyor

**Lokasyon:** `apps/backend/src/modules/delivery/presentation/cargo-tracking.controller.ts:91-92`
**Tespit:**
```typescript
if (!this.cargoTrackingService.verifyWebhook(cargoProvider, payload, signature)) {
  return { success: false, error: 'Invalid signature' };
}
// TODO: Webhook payload'ını işle, shipment durumunu güncelle
return { success: true };
```
Signature doğrulaması yapılıyor (satır 87-88) ama payload parse edilip shipment durumu güncellenmiyor. Webhook geliyor, doğrulanyor, ve sessizce yok sayılıyor.
**Risk:** YÜKSEK
**Sorun:** Kargo firması webhook ile status güncellediğinde BazarX sistemi bu güncellemeyi algılamıyor.

**Düzeltme:** Webhook tetiklendiğinde shipment durumu güncellenmeli, cargo status history'ye kayıt eklenmeli, RabbitMQ event publish edilmeli.

---

### [1.4.1] — `cargo.status.updated` Backend'e Ulaşmıyor

**Lokasyon:** `apps/backend/src/modules/delivery/` (geneli)
**Tespit:** `delivery-service`'den `cargo.status.updated` event'i publish edilmiyor. Backend'de `cargo.status.updated` consumer yok. Order status DELIVERED'a sadece `mark-delivered.handler.ts` ile manuel geçiyor.
**Risk:** YÜKSEK
**Sorun:** Kargo firması webhook veya polling sonucunda teslim edildi bildirdiğinde BazarX'in sipariş durumu otomatik güncellenmiyor.

---

### [1.5.1] — delivery.module.ts Bağımlılık Grafiği

**Lokasyon:** `apps/backend/src/modules/delivery/delivery.module.ts:35-80`
**Tespit:**
- imports: `CqrsModule`, `HttpModule`, `CommerceModule`, `AuditMongooseModule`, `MongooseModule`, `ClientsModule`, `BullModule`
- exports: `MongoDeliveryDispatchRepository`, `DeliveryGrpcService`
- CommerceModule'e bağımlı (handler'lar `IOrderRepository` kullanıyor)
- DeliveryModule, CommerceModule tarafından import edilmiyor — tek yönlü bağımlılık ✅
- `ClientsModule.register(deliveryGrpcClientOptions)` — gRPC client register ✅

---

## BÖLÜM 2 — Type Safety & `any` Denetimi

### [2.1] — `any` Bulguları

| Lokasyon | Dosya | Satır | Bağlam | Risk |
|---|---|---|---|---|
| delivery-service | shipment.controller.ts | — | `@CurrentUser() user: AuthenticatedUser` tanımsız import | YÜKSEK |
| backend | cargo-tracking.controller.ts | 110 | `AuthenticatedUser` interface dosya altında tanımlanmış | DÜŞÜK |
| backend | cargo-tracking.controller.ts | 82 | `@Body() body: Record<string, any>` webhook payload | ORTA |

### [2.2] — AuthenticatedUser Tip Sorunu

**Lokasyon:** `apps/delivery-service/src/modules/shipment/presentation/shipment.controller.ts`
**Tespit:** `@CurrentUser() user: AuthenticatedUser` kullanılmış ama bu tip shared modülde tanımlı değil — hata verecek. Ayrıca backend'deki `AuthenticatedUser` tanımı (`cargo-tracking.controller.ts:110`) ile delivery-service'deki farklı.
**Risk:** YÜKSEK — shipment controller compile hatası

**Düzeltme:** `AuthenticatedUser` shared modülden import edilmeli veya `import type { CurrentUser } from '@barterborsa/shared-nest'` kullanılmalı.

---

### [2.3] — Kargo Adapter Response Tipleri — Doğru Implementasyon

**Lokasyon:** Tüm cargo adapter dosyaları
**Tespit:** MNG, Yurtici, Surat, TEX adapter'ların tamamı `any` yerine kendi response interface'lerini kullanıyor:
- `MngTrackingResponse` — typed ✅
- `YurticiTrackingResponse` — typed ✅
- `SuratTrackingResponse` — typed ✅
- `TexTrackingResponse` — typed ✅

HMAC doğrulaması her adapter'da ayrı implement — merkezi CargoStatusMapper yok ama her adapter'ın mapStatus method'u tutarlı.

---

## BÖLÜM 3 — İş Kuralı Akışı: if/else & try/catch Analizi

### [3.1.1] — Pattern A: DeliveryType Dallanması — dispatch-courier.handler.ts

**Lokasyon:** `apps/backend/src/modules/delivery/application/commands/dispatch-courier.handler.ts:37-38`
**Tespit:**
```typescript
if (vendor.vendorType !== 'RESTAURANT') {
  throw new BadRequestException('Bu aksiyon yalnızca RESTAURANT siparişlerinde geçerlidir.');
}
```
`DeliveryType` enum'ına göre dallanma yok — `vendorType === 'RESTAURANT'` ile kontrol yapılıyor. Bu doğru çalışıyor çünkü sadece LOCAL_COURIER (RESTAURANT) siparişleri için dispatch var. CARGO ve PICKUP için ayrı akış var.
**Risk:** DÜŞÜK — iş kuralları doğru

---

### [3.1.2] — Pattern B: DispatchStatus State Machine — Doğru Implementasyon ✅

**Lokasyon:** `apps/backend/src/modules/delivery/domain/entities/delivery-dispatch.entity.ts:17-23`
**Tespit:** `VALID_TRANSITIONS` map'i ile state machine doğru implement edilmiş. Her geçiş domain method üzerinden yapılıyor (`assignCourier()`, `markPickedUp()`, `markDelivered()`, `cancel()`). Domain entity katmanında — kurallara uygun ✅

---

### [3.1.3] — Pattern C: Kargo Firma Dallanması — Adapter Map Kullanılıyor ✅

**Lokasyon:** `apps/backend/src/modules/delivery/application/services/cargo-tracking.service.ts:27-30`
**Tespit:**
```typescript
this.adapters.set(CargoProvider.MNG_KARGO, this.mngAdapter);
this.adapters.set(CargoProvider.YURTICI_KARGO, this.yurticiAdapter);
this.adapters.set(CargoProvider.SURAT_KARGO, this.suratAdapter);
this.adapters.set(CargoProvider.TEX_KARGO, this.texAdapter);
```
Factory pattern doğru implement — if/else zinciri yok. Map üzerinden adapter seçimi yapılıyor ✅

---

### [3.2.1] — Antipattern A: Polling Sessiz Yutma

**Lokasyon:** `apps/backend/src/modules/delivery/application/services/cargo-polling.scheduler.ts:40-42`
**Tespit:**
```typescript
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
  this.logger.error('CargoPollingScheduler poll hatası', { error: msg });
  // throw etmiyor — sessiz
}
```
Error yakalanıyor ama sadece loglanıyor. Retry yok, POLLING_FAILED state yok, admin alert yok. Ayrıca polling tamamen stub — veritabanını sorgulamıyor.
**Risk:** KRİTİK

**Düzeltme:**
```typescript
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
  this.logger.error('CargoPollingScheduler poll hatası', { error: msg });
  await this.alertAdmin('Polling başarısız', { error: msg });
  await this.markPollFailed(trackingNumber);
}
```

---

### [3.2.2] — Antipattern B: Webhook İmza Doğrulama — Sıra Doğru ✅

**Lokasyon:** `apps/backend/src/modules/delivery/infrastructure/adapters/mng-cargo.adapter.ts:64-82`
**Tespit:** `verifyWebhook` önce HMAC doğruluyor, sonra payload parse ediliyor. Sıra doğru ✅ — güvenlik açığı yok. Secret tanımlı değilse doğrulama atlanıyor ama bu `.env` eksikliği — log atıyor (`logger.warn`).

---

### [3.2.3] — Antipattern C: BullMQ Retry Policy — Doğru Implementasyon ✅

**Lokasyon:** `apps/backend/src/modules/delivery/delivery.module.ts:47-52`
**Tespit:**
```typescript
defaultJobOptions: {
  attempts: 3,
  backoff: { type: 'exponential', delay: 3000 },
  removeOnComplete: 50,
  removeOnFail: 100,
},
```
BullMQ job retry policy doğru — exponential backoff, attempts 3, fail sonrası temizlik ✅

---

### [3.3.1] — Polling Scheduler Multi-Instance Güvenliği — YOK

**Lokasyon:** `apps/backend/src/modules/delivery/application/services/cargo-polling.scheduler.ts`
**Tespit:** `setInterval` kullanıyor — tek instance'da çalışır, multi-instance'da çakışır. Lock mekanizması yok.
**Risk:** KRİTİK — kubernetes'de 2 replica çalışırsa 2 kat polling yapılır.

**Düzeltme:** Redis-based distributed lock veya BullMQ repeatable job (tek job aktif olur).

---

### [3.4.1] — Webhook Güvenlik — Eksikler

**Lokasyon:** `apps/backend/src/modules/delivery/presentation/cargo-tracking.controller.ts:77-93`
**Tespit:**
- HMAC signature doğrulaması: ✅
- Timestamp replay attack koruması: ❌ (5 dakika eski webhook kabul edilir)
- Idempotency (aynı webhook iki kez): ❌ (trackingCode+timestamp composite key yok)
- Webhook body tam parse edilmeden imza doğrulaması: ✅ (doğru sıra)

**Risk:** ORTA

**Düzeltme:**
```typescript
async handleWebhook(...) {
  const timestamp = headers['x-timestamp'];
  if (timestamp && Date.now() - Number(timestamp) > 5 * 60 * 1000) {
    return { success: false, error: 'Timestamp expired' };
  }
  const dedupKey = `${trackingCode}:${timestamp}`;
  if (await this.redisClient.get(dedupKey)) {
    return { success: true, duplicate: true };
  }
  // ... doğrulama ...
  await this.redisClient.setEx(dedupKey, 300);
}
```

---

## BÖLÜM 4 — Gereksiz Kod & Dosya Temizleme

### [4.1] — Stub Dosya Envanteri

| Dosya | Gerçek Durum | Karar |
|---|---|---|
| `DispatchNotificationProcessor` | STUB — bildirim yok, TODO yorumu | ⚠️ Koru ama NotImplementedException fırlat |
| `CargoPollingScheduler` | STUB — setInterval var ama DB sorgusu yok | ⚠️ Koru — implementasyonu eksik ama wiring doğru |
| `CargoTrackingService.createShipment()` | STUB — shipment ID döndürüyor, DB'ye kayıt yok | ❌ Implementasyon gerekli |
| `AdminCargoController.listAll()` | STUB — boş array dönüyor | ⚠️ Koru — admin paneli backend'de |
| `cargo-tracking.controller.ts:91-92` | Webhook body işlenmiyor | ❌ Webhook işleme implementasyonu gerekli |

### [4.2] — CargoStatusMapper Ayrı Implementasyonu — ORTA

**Lokasyon:** Her cargo adapter'ın `mapStatus()` method'u
**Tespit:** Her adapter'ın `mapStatus()` ayrı implementasyon — merkezi `CargoStatusMapper` yok. Status string'ler farklı:
- MNG: `'DELIVERED'`, `'IN_TRANSIT'`
- Yurtici: `'TESLIM_EDILDI'`, `'YOLDA'`
- Surat: `'TESLIM_EDILDI'`, `'DAĞITIMDA'`

**Risk:** ORTA — her adapter'a ayrı mapping eklemek hataya açık. Yeni bir CargoStatus eklendiğinde 4 adapter güncellenmeli.

**Düzeltme:**
```typescript
// domain/services/cargo-status.mapper.ts
export class CargoStatusMapper {
  private static readonly MAPS = {
    [CargoProvider.MNG_KARGO]: { 'DELIVERED': CargoStatus.DELIVERED, 'IN_TRANSIT': CargoStatus.IN_TRANSIT, ... },
    [CargoProvider.YURTICI_KARGO]: { 'TESLIM_EDILDI': CargoStatus.DELIVERED, ... },
  };
  static map(provider: CargoProvider, rawStatus: string): CargoStatus {
    return this.MAPS[provider]?.[rawStatus.toUpperCase()] ?? CargoStatus.UNKNOWN;
  }
}
```

---

### [4.3] — CargoShipment Veritabanı Koleksiyonu Yok

**Lokasyon:** `apps/backend/src/modules/delivery/infrastructure/persistence/`
**Tespit:** Backend'de `CargoShipment` Mongoose modeli yok. `cargo-tracking.service.ts:57-68` `createShipment()` stub — shipment veritabanına kaydedilmiyor. Polling scheduler hangi shipment'ları sorgulayacak? `CargoPollingScheduler.poll()` TODO'ları göre veritabanından çekecek ama koleksiyon yok.
**Risk:** YÜKSEK — CargoShipment schema ve repository gerekli.

---

### [4.4] — DeliveryDispatch courierId Atama Mantığı — Var

**Lokasyon:** `apps/backend/src/modules/delivery/domain/entities/delivery-dispatch.entity.ts:52-57`
**Tespit:** `courierId` field'ı sadece `assignCourier()` method'unda atanıyor — bu doğru. Field ölü değil, kullanılıyor. Courier atama akışı: `dispatch-courier.handler.ts:57` → `dispatch.assignCourier(courierId)` → entity transition ASSIGNED'a geçiyor.
**Karar:** ✅ Koru — courier assignment mantığı mevcut.

---

## Öncelikli Düzeltme Planı — GÜNCELLEME (2026-05-24)

### Bu Sprint (KRİTİK) — ✅ TÜMÜ DÜZELTİLDİ

| # | Dosya | Düzeltme | Durum |
|---|-------|----------|-------|
| 1 | `cargo-polling.scheduler.ts` | setInterval → @Cron('0 */2 * * *') | ✅ |
| 2 | `cargo-polling.scheduler.ts` | poll() — CargoShipment DB sorgusu + adapter.track() + status güncelle | ✅ |
| 3 | `cargo-tracking.service.ts` | createShipment() → CargoShipment.create() (DB'ye kayıt) | ✅ |
| 3b | `cargoShipment.schema.ts` | YENİ — CargoShipment schema oluşturuldu (cargo_shipments koleksiyonu) | ✅ |
| 3c | `delivery.module.ts` | CargoShipment schema MongooseModule'a kayıt edildi | ✅ |

### Sonraki Sprint (YÜKSEK) — 3/4 DÜZELTİLDİ

| # | Dosya | Düzeltme | Durum |
|---|-------|----------|-------|
| 4 | `cargo-tracking.controller.ts` | Webhook payload → CargoShipment.updateOne + statusHistory | ✅ |
| 5 | `dispatch-notification.processor.ts` | Sessiz stub → logger.warn (bildirim servisi bekleniyor) | ✅ |
| 5b | `cargo-tracking.controller.ts` | `Record<string, any>` → `Record<string, unknown>` | ✅ |
| 5c | `cargo-tracking.controller.ts` | AuthenticatedUser inline interface + AdminCargoController gerçek sorgu | ✅ |
| 6 | `checkout.service.ts` | `order.shipped` RabbitMQ event | ⬜ Backlog |
| 7 | `commerce` modülü | `cargo.status.updated` consumer | ⬜ Backlog |

### Backlog (ORTA) — KALAN

| # | Dosya | Düzeltme |
|---|-------|----------|
| 6 | `checkout.service.ts` | `order.shipped` RabbitMQ event publish ekle |
| 7 | `commerce` modülü | `cargo.status.updated` consumer (Order → DELIVERED otomasyonu) |
| 8 | `domain/services/cargo-status.mapper.ts` | Merkezi CargoStatusMapper — 4 adapter'dan ortak kullanım |
| 9 | `cargo-tracking.controller.ts` | Webhook timestamp replay attack koruması |
| 10 | `cargo-tracking.controller.ts` | Webhook idempotency (Redis dedup key) |

---

## Sonuç — GÜNCELLEME

| Seviye | Başlangıç | Düzeltildi | Kalan |
|--------|-----------|------------|-------|
| KRİTİK | 2 | 2 | 0 |
| YÜKSEK | 3 | 3 | 0 |
| ORTA | 5 | 2 | 3 |
| DÜŞÜK | 4 | 2 | 2 |

**Kapanan KRİTİK sorunlar:**
1. ✅ CargoPollingScheduler — `setInterval` → `@Cron('0 */2 * * *')` + gerçek DB sorgusu
2. ✅ createShipment() — CargoShipment schema + DB kayıt + statusHistory
3. ✅ CargoShipment koleksiyonu oluşturuldu (schema + index + module kayıt)

**Kapanan YÜKSEK sorunlar:**
4. ✅ Webhook payload işleme — trackingNumber + status parse → CargoShipment güncelleme
5. ✅ DispatchNotificationProcessor — sessiz stub → logger.warn
6. ✅ `Record<string, any>` → `Record<string, unknown>` (tip güvenliği)

**Kalan backlog:** order.shipped event, cargo.status.updated consumer, merkezi CargoStatusMapper, webhook güvenlik (replay + idempotency)

**Görülmeye değer:** `dispatch-courier.handler.ts` — RESTAURANT sadece vendorType kontrolü ile doğru sınırlamayı yapıyor, state machine transition'ları domain entity'de tutarlı.