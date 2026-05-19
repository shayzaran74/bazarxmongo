# BazarX Go Entegrasyonu — Birleşik Vendor Dashboard Planı

> **Durum:** Implementasyon devam ediyor (2026-05-11).
> **Veritabanı:** MongoDB + Mongoose (Prisma kaldırıldı).
> **Scope:** 4 faz, end-to-end (Schema → Backend → Frontend → Courier/Verification)
>
> **İlerleme:**
> - ✅ **Faz 1 — Schema & Migration** (2026-05-11): `VendorType` enum, `Vendor.vendorType`, `VendorProfile` restoran alanları, `VendorSettings.holidayMode/acceptingOrders`, `OrderStatus` (PREPARING/READY/AWAITING_PICKUP/OUT_FOR_DELIVERY), `DeliveryType` enum + `Order.deliveryType`, `MenuPurchase.listingId` FK rename, `LaunchPartner.vendorId`. Mongoose schema güncellemeleri + index sync scripti hazır. `Restaurant` + `BazarXMenu` collection'ları DROP edildi.
> - ✅ **Faz 2 — Backend** (2026-05-11): Vendor domain (`VendorType` enum, `isRestaurant()`, restoran VO alanları), `register-vendor` vendorType + `restaurantProfile` desteği, `PATCH /vendors/me/restaurant-settings` endpoint + handler + AuditLog. Order domain'e PREPARING/READY/AWAITING_PICKUP/OUT_FOR_DELIVERY transitions + `markPreparing()`/`markReady()`/`awaitPickup()`/`dispatchToCourier()` metodları; `MarkOrderPreparingHandler`/`MarkOrderReadyHandler` + RBAC + AuditLog; `POST /orders/:id/mark-preparing|mark-ready` endpoint'leri. `checkout.service.ts` vendorType'a göre `deliveryType` set ediyor. Menu modülü: `purchase-menu` + `redeem-menu` + `get-my-purchases` + `get-launch-partners` + `advance-launch-partner-phase` + `distribute-free-menu` artık Listing/Vendor referanslarıyla; `Restaurant`/`BazarXMenu` entity'leri ve repository'leri SİLİNDİ. Mappers ve repository'ler tip-güvenli (`any` = 0). `tsc --noEmit` ✅ 0 hata.
> - ✅ **Faz 3 — Frontend** (2026-05-11): Vendor Type selection (StepVendorType.vue), useVendor composable, useOrderStatusLabel composable, conditional VendorSidebar, ProductForm vendorType-aware, RestaurantSettingsSection, useProductForm.ts RESTAURANT fields.
> - ✅ **Faz 4 — Courier/Delivery & Verification** (2026-05-11): DeliveryModule oluşturuldu (`DeliveryDispatch` Mongoose schema, `DispatchStatus` enum, handler'lar, controller, repository). `POST /orders/:id/dispatch` endpoint'i eklendi. BullMQ `DELIVERY_DISPATCH_QUEUE` eklendi. `DispatchNotificationProcessor` (stub) consumer eklendi. `tsc --noEmit` ✅ 0 hata. ⚠️ Gerçek bildirim (SMS/Push) sonraki sprint'te.

---

## Context

BazarX bugün **iki ayrı dünyaya** bölünmüş durumda:
- **E-ticaret tarafı:** `Vendor → Listing → Cart → Order` (DDD/CQRS uyumlu, üretim olgunluğunda)
- **Restoran tarafı:** `Restaurant → BazarXMenu → MenuPurchase → QR Redemption` (Master Plan v4.3 Faz 2'de abonelik için kurulmuş kapalı QR sistemi)

Bu plan, **restoranı birinci sınıf bir Vendor tipi** yaparak iki tarafı tek dashboard altında birleştirir.

### Mimari Karar Matrisi
| Karar | Seçim | Gerekçe |
|---|---|---|
| Menu/QR sistemi | **Yan yana yaşar** | Abonelik bazlı bedava menü Master Plan §Faz 2'de canlı; bozulmayacak |
| Restaurant + BazarXMenu collection'ları | **DROP** | Vendor + Listing modeline tam entegrasyon |
| `MenuPurchase.menuId` | **→ `listingId` ref** | QR sistemi Listing üzerinden çalışacak |
| **ORM** | **Mongoose** | Prisma kaldırıldı, tüm schema'lar Mongoose ile |

---

## Faz 1 — Database Schema (Mongoose)

### Mongoose Schema Değişiklikleri

1. **Yeni enum: `VendorType`**
   ```typescript
   export enum VendorType { COMMERCE = 'COMMERCE', RESTAURANT = 'RESTAURANT', MARKET = 'MARKET', SERVICE = 'SERVICE' }
   ```

2. **`Vendor` schema'sına alan:**
   ```typescript
   @Prop({ type: String, enum: VendorType, default: VendorType.COMMERCE })
   vendorType: VendorType;
   ```

3. **`VendorProfile` schema'sına restoran alanları (hepsi opsiyonel):**
   ```typescript
   @Prop({ type: Object }) openingHours?: Record<string, any>;
   @Prop() cuisineType?: string;
   @Prop() deliveryRadius?: number;
   @Prop({ type: Types.Decimal128 }) minOrderAmount?: Types.Decimal128;
   @Prop() avgPrepTimeMinutes?: number;
   ```

4. **`VendorSettings` schema'sına:**
   ```typescript
   @Prop({ default: false }) holidayMode: boolean;
   @Prop({ default: true }) acceptingOrders: boolean;
   ```

5. **`Order` schema'sına `OrderStatus` enum genişletmesi:**
   `PREPARING`, `READY`, `AWAITING_PICKUP`, `OUT_FOR_DELIVERY` eklendi.

6. **`Order` schema'sına:**
   ```typescript
   export enum DeliveryType { CARGO = 'CARGO', LOCAL_COURIER = 'LOCAL_COURIER', PICKUP = 'PICKUP' }
   @Prop({ type: String, enum: DeliveryType, default: DeliveryType.CARGO })
   deliveryType: DeliveryType;
   ```

7. **DROP:** `Restaurant`, `BazarXMenu` collection'ları ve ilgili Mongoose model'leri.

8. **`MenuPurchase`:** `menuId` → `listingId` (Listing ObjectId ref).

9. **`LaunchPartner`:** `restaurantId` → `vendorId`.

10. **Index sync komutu:**
    ```bash
    pnpm --filter backend mongoose:sync-indexes
    # veya prod'da:
    sudo docker exec -it bazarx_backend sh -c "node dist/scripts/sync-indexes.js"
    ```

---

## Faz 2 — Backend (NestJS / DDD / CQRS)

### Vendor Modülü
- `domain/entities/vendor.entity.ts` — `vendorType` props + `isRestaurant()` helper
- `domain/value-objects/restaurant-profile.vo.ts` **(yeni)**
- `application/commands/register-vendor.{command,handler}.ts` — `vendorType` + opsiyonel `restaurantProfile`
- `application/commands/update-restaurant-settings.{command,handler}.ts` **(yeni)**
- Yeni endpoint: `PATCH /vendors/me/restaurant-settings`

### Catalog/Listing Modülü
- `application/commands/create-listing.handler.ts` — vendorType=RESTAURANT için CategoryAttribute validation
- `application/services/listing-validator.service.ts` **(yeni)** — vendorType-aware

### Commerce/Order Modülü
- `domain/entities/order.entity.ts` — `VALID_TRANSITIONS` güncelle:
  - `PROCESSING → PREPARING → READY → AWAITING_PICKUP / OUT_FOR_DELIVERY → DELIVERED` (RESTAURANT)
  - Mevcut e-ticaret geçişleri bozulmaz
- `MarkOrderPreparingHandler`, `MarkOrderReadyHandler` — Mongoose session ile çalışır
- Yeni endpoints: `POST /orders/:id/mark-preparing`, `/mark-ready`

### Menu Modülü
- `purchase-menu.handler.ts` — `Listing` lookup; günlük limit `Listing.metadata.dailyLimit`'ten
- `redeem-menu.handler.ts` — `listingId` ref ile
- **DROP:** `BazarXMenu` Mongoose model ve repository

### Common
- Tip güvenliği: `any` = 0
- Logging: Sadece `StructuredLogger`
- Her yeni handler için `*.spec.ts`

---

## Faz 3 — Frontend (Nuxt 3 / Vue 3)

### Onboarding
- `StepVendorType.vue` **(yeni)** — 4 kart: Ticaret / Restoran / Market / Hizmet
- `useVendorApplication.ts` — `vendorType` state

### Sipariş Yönetimi (Status Label'ler)

| Status | Restaurant | Commerce |
|---|---|---|
| PROCESSING | Hazırlanıyor (Mutfak) | Paketleniyor |
| PREPARING | Mutfakta | — |
| READY | Kurye Bekliyor | Kargoya Hazır |
| OUT_FOR_DELIVERY | Yolda (Kurye) | — |
| SHIPPED | — | Kargoda |
| DELIVERED | Teslim Edildi | Teslim Edildi |

---

## Faz 4 — Courier/Delivery & Verification

### Delivery Modülü
**Mongoose Schema:** `DeliveryDispatch`
```typescript
@Schema()
export class DeliveryDispatch {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true }) orderId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) courierId?: Types.ObjectId;
  @Prop({ type: String, enum: DispatchStatus, default: DispatchStatus.PENDING_ASSIGN })
  status: DispatchStatus;
  @Prop() pickedUpAt?: Date;
  @Prop() deliveredAt?: Date;
}
```

### Verification — End-to-End Manuel Test

```bash
# Ortamı hazırla
pnpm docker:up
pnpm --filter backend mongoose:sync-indexes
pnpm dev
```

**Golden path:**
1. `/become-vendor` → Tip: **Restoran** → form submit
2. Admin `/admin/vendors` → APPROVE
3. Vendor login → sidebar "Menüler" + "Canlı Siparişler"
4. `/vendor/product-form` → Kategori "Pizza" → ingredients/prepTime/calories görünür
5. Müşteri → sepete ekle → checkout
6. Vendor → "Mutfağa Al" → PREPARING → "Hazır Oldu" → READY
7. Vendor → "Kuryeye Verildi" → OUT_FOR_DELIVERY → DELIVERED

**Otomatik:**
- `pnpm test` — yeni handler spec'leri
- `pnpm lint` — `any` ve `console.*` ihlali yok
- `pnpm build` — TypeScript strict ✅

---

## Kritik Dosyalar (Toplam)

### Backend
- `apps/backend/src/modules/vendor/domain/entities/vendor.entity.ts`
- `apps/backend/src/modules/vendor/infrastructure/schemas/vendor.schema.ts` *(Mongoose)*
- `apps/backend/src/modules/catalog/infrastructure/schemas/listing.schema.ts` *(Mongoose)*
- `apps/backend/src/modules/commerce/infrastructure/schemas/order.schema.ts` *(Mongoose)*
- `apps/backend/src/modules/delivery/infrastructure/schemas/delivery-dispatch.schema.ts` *(Mongoose, yeni)*
- `apps/backend/src/scripts/sync-indexes.ts` *(index yönetimi)*

### Frontend
- `apps/frontend/components/vendor/application/StepVendorType.vue`
- `apps/frontend/composables/useOrderStatusLabel.ts`
- `apps/frontend/pages/vendor/orders.vue`
- `apps/frontend/pages/vendor/settings.vue`
