# BazarX Go — Entegrasyon Rehberi (Faz 1-4)

## Genel Bakış

BazarX Go, restoranları (RESTAURANT) birinci sınıf Vendor tipi olarak e-ticaret akışına entegre eder. Tek dashboard, tek sipariş, tek mutfak ekranı.

---

## 4 Faz Özeti

| Faz | Alan | Durum |
|-----|------|-------|
| Faz 1 | Database Schema | ✅ |
| Faz 2 | Backend (NestJS) | ✅ |
| Faz 3 | Frontend (Nuxt 3) | ✅ |
| Faz 4 | Delivery / Kurye | ✅ |

---

## Faz 1 — Database Schema

### Yeni Enum'lar

**`VendorType`** — Satıcı tipi:
```prisma
enum VendorType { COMMERCE RESTAURANT MARKET SERVICE }
```

**`DeliveryType`** — Teslim türü:
```prisma
enum DeliveryType { CARGO LOCAL_COURIER PICKUP }
```

**`DispatchStatus`** — Kurye dispatch durumu:
```prisma
enum DispatchStatus { PENDING_ASSIGN ASSIGNED PICKED_UP DELIVERED CANCELLED }
```

### Yeni Model: `DeliveryDispatch`
```prisma
model DeliveryDispatch {
  id           String         @id @default(cuid())
  orderId      String         @unique
  courierId    String?
  status       DispatchStatus @default(PENDING_ASSIGN)
  pickedUpAt   DateTime?
  deliveredAt  DateTime?
  order        Order          @relation(...)
}
```

---

## Faz 2 — Backend

### Vendor Domain
```typescript
// Restoran tipi kontrolü
const vendor = await this.prisma.vendor.findFirst({ where: { userId, id } })
if (vendor.vendorType === 'RESTAURANT') { ... }
```

### Yeni Order Durumları (RESTAURANT akışı)
```
PENDING → PAID → CONFIRMED → PROCESSING → PREPARING → READY
                                                    ↓
                              AWAITING_PICKUP / OUT_FOR_DELIVERY
                                                    ↓
                                                 DELIVERED
```

### Endpoint'ler

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/orders/:id/mark-preparing` | POST | Mutfağa alındı (RESTAURANT) |
| `/orders/:id/mark-ready` | POST | Hazır, kurye/teslim bekliyor |
| `/orders/:id/dispatch` | POST | Kuryeye verildi |
| `/delivery/dispatch` | POST | Kurye ata |
| `/delivery/:dispatchId/mark-delivered` | POST | Teslimat tamamlandı |
| `/delivery/couriers` | GET | Kurye listesi (stub) |

---

## Faz 3 — Frontend

### Vendor Type Selection
```vue
<!-- pages/vendor-application.vue — Step 0 -->
<StepVendorType v-model="form.vendorType" />
```

### Composable'lar

**`useVendor()`** — Satıcı tipi erişimi:
```typescript
const { vendorType, isRestaurant, isCommerce, isMarket, isService } = useVendor()
```

**`useOrderStatusLabel(status, vendorType?)`** — Durum etiketleri:
```typescript
const { getStatusInfo } = useOrderStatusLabel()
const info = getStatusInfo('PREPARING') // RESTAURANT: "Hazırlanıyor"
```

### Conditional UI (VendorSidebar)
```vue
<!-- components/layout/vendor/VendorSidebar.vue -->
<NuxtLink v-if="isRestaurant" to="/vendor/orders">
  <FireIcon class="h-5 w-5 mr-3" />Canlı Siparişler
</NuxtLink>
<NuxtLink v-else to="/vendor/orders">
  <DocumentTextIcon class="h-5 w-5 mr-3" />Siparişler
</NuxtLink>
```

### ProductForm (VendorType-Aware)
```vue
<!-- components/forms/ProductForm.vue -->
<ProductFormAttributesRestaurant
  v-if="vendorType === 'RESTAURANT'"
  v-model:ingredients="form.ingredients"
  v-model:preparation-time="form.preparationTime"
  v-model:calories="form.calories"
/>

<ProductFormInventoryRestaurant
  v-if="vendorType === 'RESTAURANT'"
  v-model:price="form.price"
  v-model:stock="form.stock"
  v-model:daily-limit="form.dailyLimit"
/>

<ProductFormLogistics
  v-if="vendorType !== 'RESTAURANT'"  <!-- Restoranlarda gizli -->
  v-model:requires-shipping="form.requiresShipping"
/>
```

### RestaurantSettingsSection
```vue
<!-- components/vendor/settings/RestaurantSettingsSection.vue -->
<RestaurantSettingsSection
  v-if="vendorType === 'RESTAURANT'"
  :form="form"
/>
```

---

## Faz 4 — Delivery / Kurye (BullMQ)

### Kuyruk Yapısı
```
DELIVERY_DISPATCH_QUEUE (BullMQ)
└── Job: "courier-assigned" (DispatchNotificationJob)
    ├── dispatchId
    ├── orderId
    ├── restaurantName
    ├── pickupAddress
    ├── customerName
    ├── customerPhone
    └── estimatedDeliveryMinutes
```

### Kullanım (DispatchCourierHandler içinde)
```typescript
// Kurye atandığında queue'ya job ekle
await this.dispatchQueue.add('courier-assigned', notificationJob, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 3000 },
});
```

### Bildirim Consumer (Stub)
```typescript
// DispatchNotificationProcessor — gerçek SMS/Push entegrasyonu buraya
async process(job: Job<DispatchNotificationJob>): Promise<void> {
  // TODO: SMS (Netgsm/Twilio) veya Push Notification (FCM) gönder
  console.log(`[DeliveryDispatch] Kurye atandı. orderId=${job.data.orderId}`)
}
```

---

## Migration

### Çalıştırıldı (2026-05-11):
```bash
pnpm prisma db push  # DeliveryDispatch tablosu + DispatchStatus enum
```

### Manuel çalıştırmak için:
```bash
cd apps/backend
pnpm prisma:migrate dev --name delivery_dispatch
```

---

## Golden Path (Test)

1. `/become-vendor` → Tip: **Restoran** seç → formu doldur
2. Admin `/admin/vendors` → APPROVE
3. Vendor login → `/vendor/dashboard` → sidebar "Menüler" + "Canlı Siparişler" görünür
4. `/vendor/product-form` → Kategori "Pizza" → Malzemeler, Hazırlama Süresi, Kalori görünür; Lojistik gizli
5. `/vendor/settings` → RESTAURANT için Çalışma Saatleri, Tatil Modu, Teslimat Yarıçapı görünür
6. Müşteri `/bazarx-go` → restorandan sipariş → checkout
7. Vendor `/vendor/orders` → "Mutfağa Al" → PREPARING → "Hazır Oldu" → READY
8. Vendor "Kuryeye Verildi" → OUT_FOR_DELIVERY → BullMQ job tetiklenir (stub log)
9. "Teslim Edildi" → DELIVERED

---

## Önemli Notlar

- **Kurye listesi stub:** `/delivery/couriers` endpoint'i boş array döner. CourierUser tablosu sonraki sprint'te eklenecek.
- **Bildirim stub:** `DispatchNotificationProcessor` sadece console.log yapıyor. SMS/Push entegrasyonu sonraki sprint'te.
- **Vendor type override:** ProductForm'da `vendorTypeOverride` prop'u ile geçici olarak farklı vendor type test edilebilir.
- **Status transitions:** RESTAURANT için state machine `PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED` şeklinde ilerler. COMMERCE akışı (SHIPPED) bozulmaz.

---

## Dosya Yapısı (Yeni Eklenenler)

```
apps/backend/src/modules/delivery/
├── delivery.module.ts
├── domain/
│   ├── entities/delivery-dispatch.entity.ts
│   ├── enums/dispatch-status.enum.ts
│   └── repositories/delivery-dispatch.repository.interface.ts
├── application/
│   ├── commands/
│   │   ├── dispatch-courier.command.ts
│   │   ├── dispatch-courier.handler.ts
│   │   ├── mark-delivered.command.ts
│   │   └── mark-delivered.handler.ts
│   └── workers/
│       └── dispatch-notification.processor.ts
├── infrastructure/
│   └── persistence/
│       └── prisma-delivery-dispatch.repository.ts
└── presentation/
    └── delivery.controller.ts

apps/frontend/components/product/form/
├── ProductFormAttributesRestaurant.vue   (yeni)
└── ProductFormInventoryRestaurant.vue    (yeni)

apps/frontend/components/vendor/settings/
└── RestaurantSettingsSection.vue       (yeni)
```