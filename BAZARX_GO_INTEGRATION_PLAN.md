# BazarX Go Entegrasyonu — Birleşik Vendor Dashboard Planı

> **Durum:** Implementasyon devam ediyor (2026-05-11).
> **Scope:** 4 faz, end-to-end (Schema → Backend → Frontend → Courier/Verification)
>
> **İlerleme:**
> - ✅ **Faz 1 — Schema & Migration** (2026-05-11): `VendorType` enum, `Vendor.vendorType`, `VendorProfile` restoran alanları, `VendorSettings.holidayMode/acceptingOrders`, `OrderStatus` (PREPARING/READY/AWAITING_PICKUP/OUT_FOR_DELIVERY), `DeliveryType` enum + `Order.deliveryType`, `MenuPurchase.listingId` FK rename, `LaunchPartner.vendorId`, `Restaurant`+`BazarXMenu` DROP. Migration SQL ve seed (RESTAURANT Category + 7 CategoryAttribute) hazır. `prisma generate` ✅.
> - ✅ **Faz 2 — Backend** (2026-05-11): Vendor domain (`VendorType` enum, `isRestaurant()`, restoran VO alanları), `register-vendor` vendorType + `restaurantProfile` desteği, `PATCH /vendors/me/restaurant-settings` endpoint + handler + AuditLog. Order domain'e PREPARING/READY/AWAITING_PICKUP/OUT_FOR_DELIVERY transitions + `markPreparing()`/`markReady()`/`awaitPickup()`/`dispatchToCourier()` metodları; `MarkOrderPreparingHandler`/`MarkOrderReadyHandler` + RBAC + AuditLog; `POST /orders/:id/mark-preparing|mark-ready` endpoint'leri. `checkout.service.ts` vendorType'a göre `deliveryType` set ediyor. Menu modülü: `purchase-menu` + `redeem-menu` + `get-my-purchases` + `get-launch-partners` + `advance-launch-partner-phase` + `distribute-free-menu` artık Listing/Vendor FK'larıyla; `Restaurant`/`BazarXMenu` referansları ve `create-restaurant`/`create-menu`/`browse-restaurants`/`get-restaurant-detail`/`restaurant-admin.controller` deprecated dosyalar SİLİNDİ. Mappers ve repositories tip-güvenli (`any` = 0). `tsc --noEmit` ✅ 0 hata.
> - ✅ **Faz 3 — Frontend** (2026-05-11): Vendor Type selection (StepVendorType.vue), useVendor composable, useOrderStatusLabel composable (RESTAURANT/COMMERCE/MARKET/SERVICE status labels), conditional VendorSidebar ("Menüler" vs "Ürünler", "Canlı Siparişler" for restaurants), ProductForm vendorType-aware (RESTAURANT: ProductFormAttributesRestaurant ingredients/prepTime/calories, ProductFormInventoryRestaurant dailyLimit, Logistics gizli), RestaurantSettingsSection (openingHours, deliveryRadius, minOrderAmount, holidayMode, acceptingOrders), useProductForm.ts RESTAURANT fields (ingredients, preparationTime, calories, dailyLimit), vendor/settings.vue conditional restaurant settings.
> - ✅ **Faz 4 — Courier/Delivery & Verification** (2026-05-11): DeliveryModule oluşturuldu (`DeliveryDispatch` entity, `DispatchStatus` enum, `DispatchCourierCommand`/`DispatchCourierHandler`, `MarkDeliveredCommand`/`MarkDeliveredHandler`, `DeliveryController`, `PrismaDeliveryDispatchRepository`). `DeliveryDispatch` Prisma modeli + schema'ya eklendi. `POST /orders/:id/dispatch` endpoint'i eklendi. `DeliveryModule` app.module'a kaydedildi. BullMQ `DELIVERY_DISPATCH_QUEUE` eklendi — kurye atandığında async bildirim job'ı queue'ya gönderiliyor. `DispatchNotificationProcessor` (stub) consumer olarak eklendi. `tsc --noEmit` ✅ 0 hata. ⚠️ Migration: `pnpm prisma db push` (zaten çalıştırıldı). ⚠️ Gerçek bildirim (SMS/Push) sonraki sprint'te.

---

## Context

BazarX bugün **iki ayrı dünyaya** bölünmüş durumda:
- **E-ticaret tarafı:** `Vendor → Listing → Cart → Order` (DDD/CQRS uyumlu, üretim olgunluğunda)
- **Restoran tarafı:** `Restaurant → BazarXMenu → MenuPurchase → QR Redemption` (Master Plan v4.3 Faz 2'de abonelik için kurulmuş kapalı QR sistemi)

Bu plan, **restoranı birinci sınıf bir Vendor tipi** yaparak iki tarafı tek dashboard altında birleştirir. Müşteri için tek sepet, tek sipariş; restoran için tek mutfak ekranı; admin için tek vendor onay akışı. Master Plan'ın §Faz 2'de kurduğu **abonelik+QR sistemi yan yana yaşamaya devam eder** — Plus üyeleri QR ile bedava menü kullanmaya devam eder, ancak QR akışı artık `Listing` üzerinden çalışır.

### Mimari Karar Matrisi
| Karar | Seçim | Gerekçe |
|---|---|---|
| Menu/QR sistemi | **Yan yana yaşar** | Abonelik bazlı bedava menü Master Plan §Faz 2'de canlı; bozulmayacak |
| Restaurant + BazarXMenu tabloları | **DROP** | Vendor + Listing modeline tam entegrasyon; tek doğru kaynak |
| `MenuPurchase.menuId` | **→ `listingId` FK** | QR sistemi Listing üzerinden çalışacak |
| Scope | **Tam plan (4 faz)** | End-to-end birleşik dashboard |

---

## Faz 1 — Database Schema & Migration

### Prisma schema değişiklikleri (`apps/backend/prisma/schema.prisma`)

1. **Yeni enum: `VendorType`**
   ```prisma
   enum VendorType { COMMERCE  RESTAURANT  MARKET  SERVICE }
   ```
2. **`Vendor` modeline alan:** `vendorType VendorType @default(COMMERCE)`
3. **`VendorProfile` modeline restoran alanları (hepsi opsiyonel):**
   - `openingHours Json?` (haftalık çalışma saatleri)
   - `cuisineType String?` (kebap, pizza, vs.)
   - `deliveryRadius Float?` (km)
   - `minOrderAmount Decimal?`
   - `avgPrepTimeMinutes Int?`
4. **`VendorSettings` modeline:**
   - `holidayMode Boolean @default(false)`
   - `acceptingOrders Boolean @default(true)`
5. **`OrderStatus` enum'a yeni değerler:** `PREPARING`, `READY`, `AWAITING_PICKUP`, `OUT_FOR_DELIVERY`
6. **`Order` modeline:** `deliveryType DeliveryType @default(CARGO)` + yeni enum:
   ```prisma
   enum DeliveryType { CARGO  LOCAL_COURIER  PICKUP }
   ```
7. **DROP:** `Restaurant`, `BazarXMenu` tabloları
8. **`MenuPurchase`:** `menuId` → `listingId` (Listing FK)
9. **`LaunchPartner.restaurantId`** → `vendorId`
10. **Seed:** RESTAURANT tipi Category + `CategoryAttribute` (ingredients, prepTime, calories, addOnGroups)

### Migration sırası (`apps/backend/prisma/migrations/<timestamp>_vendor_type_restaurant/migration.sql`)
1. `VendorType` enum + `Vendor.vendorType` (default COMMERCE)
2. `OrderStatus`'a yeni değerler
3. `DeliveryType` enum + `Order.deliveryType`
4. `MenuPurchase.listingId` ekle → FK bind → `menuId` drop
5. `LaunchPartner.restaurantId` → `vendorId`
6. `BazarXMenu`, `Restaurant` drop
7. `VendorProfile` / `VendorSettings` yeni alanlar

### Komut
```bash
pnpm prisma:generate
pnpm prisma:migrate dev --name vendor_type_restaurant
pnpm prisma:seed
```

---

## Faz 2 — Backend (NestJS / DDD / CQRS)

### Vendor Modülü
- `domain/entities/vendor.entity.ts` — `vendorType` props + `isRestaurant()` helper
- `domain/value-objects/restaurant-profile.vo.ts` **(yeni)**
- `application/commands/register-vendor.{command,handler}.ts` — `vendorType` + opsiyonel `restaurantProfile`
- `application/commands/update-restaurant-settings.{command,handler}.ts` **(yeni)**
- `presentation/dto/register-vendor.dto.ts` — `@IsEnum(VendorType)` + conditional validation
- Yeni endpoint: `PATCH /vendors/me/restaurant-settings`
- AuditLog: `VENDOR_TYPE_SET`, `RESTAURANT_SETTINGS_UPDATED`

### Catalog/Listing Modülü
- `application/commands/create-listing.handler.ts` — vendorType=RESTAURANT için:
  - `CategoryAttribute` validation (ingredients, prepTime, calories)
  - `weight`, `volume`, shipping alanları opsiyonel
- `domain/entities/listing.entity.ts` — `getRestaurantMetadata()` helper
- `application/services/listing-validator.service.ts` **(yeni)** — vendorType-aware

### Commerce/Order Modülü
- `domain/enums/order-status.enum.ts` — yeni status'lar
- `domain/entities/order.entity.ts` — `VALID_TRANSITIONS` güncelle:
  - `PROCESSING → PREPARING → READY → AWAITING_PICKUP / OUT_FOR_DELIVERY → DELIVERED` (RESTAURANT)
  - Mevcut e-ticaret geçişleri bozulmaz
- Yeni commands:
  - `MarkOrderPreparingCommand` + handler
  - `MarkOrderReadyCommand` + handler
  - `DispatchCourierCommand` + handler (Faz 4'te aktive)
- `application/services/checkout.service.ts` — vendor.vendorType'a göre `deliveryType` setle
- `application/queries/get-vendor-orders.handler.ts` — response'a `deliveryType` ekle
- Yeni endpoints: `POST /orders/:id/mark-preparing`, `/mark-ready`

### Menu Modülü (Yan Yana — Abonelik QR)
- `application/commands/purchase-menu.handler.ts` — `BazarXMenu` → `Listing` lookup; günlük limit `Listing.metadata['dailyLimit']`'ten
- `application/commands/redeem-menu.handler.ts` — FK rename'e bağlı küçük değişim
- **DROP:** `BazarXMenu` entity'si, repository'si

### Common
- **Tip güvenliği:** `AuthenticatedUser`, DTO, `Prisma.*WhereInput`. `any` = 0.
- **Logging:** Sadece `StructuredLogger`.
- **Test:** Her yeni handler için `*.spec.ts`.

---

## Faz 3 — Frontend (Nuxt 3 / Vue 3)

### Onboarding (Vendor Application)
- `pages/vendor-application.vue` — yeni **Adım 0: Tip Seçimi**
- `components/vendor/application/StepVendorType.vue` **(yeni)** — 4 kart: Ticaret / Restoran / Market / Hizmet
- `components/vendor/application/StepBankCategories.vue` — RESTAURANT için ek alanlar (cuisineType, openingHours, deliveryRadius, minOrderAmount)
- `composables/useVendorApplication.ts` — `vendorType` state

### Pinia Store / Composable
- `composables/useVendor.ts` — `vendorType` reactive state; `useVendorType()` shortcut

### Sidebar (Conditional)
- `components/layout/vendor/VendorSidebar.vue` — vendorType watch:
  - **RESTAURANT:** "Ürünler"→"Menüler", "Envanter"→"Menü Stok", yeni "Canlı Siparişler"
  - **COMMERCE:** mevcut yapı

### Ürün/Menü Form (Context-Aware)
- `components/forms/ProductForm.vue` — `vendorType` inject
- `components/forms/product/ProductFormAttributes.vue` — RESTAURANT kategorisi seçilirse ingredients/prepTime/calories alanları + addOnGroups dinamik liste
- `components/forms/product/ProductFormLogistics.vue` — `v-if="vendorType !== 'RESTAURANT'"`
- `components/forms/product/ProductFormInventory.vue` — RESTAURANT için "Günlük Limit"
- `composables/useProductForm.ts` — adım listesi `computed` ile vendorType'a göre

### Sipariş Yönetimi (Status Label'ler)
- `composables/useOrderStatusLabel.ts` **(yeni)**:

  | Status | Restaurant | Commerce |
  |---|---|---|
  | PROCESSING | Hazırlanıyor (Mutfak) | Paketleniyor |
  | PREPARING | Mutfakta | — |
  | READY | Kurye Bekliyor | Kargoya Hazır |
  | OUT_FOR_DELIVERY | Yolda (Kurye) | — |
  | SHIPPED | — | Kargoda |
  | DELIVERED | Teslim Edildi | Teslim Edildi |

- `pages/vendor/orders.vue` — `useOrderStatusLabel` + RESTAURANT için "Hazır Oldu", "Kuryeye Verildi" aksiyon butonları
- `components/admin/orders/AdminOrderTable.vue` — aynı composable

### Ayarlar (Restoran-Özel)
- `pages/vendor/settings.vue` — `v-if="vendorType === 'RESTAURANT'"`:
  - Çalışma Saatleri (haftalık tablo)
  - Tatil Modu toggle
  - "Sipariş Almıyorum" toggle (`acceptingOrders`)
  - Teslimat Yarıçapı, Min. Sipariş Tutarı

### Tutarlılık
- `<script setup lang="ts">` zorunlu
- `useRuntimeConfig().public.apiBase`
- SSR-safe (`window` → `onMounted`)

---

## Faz 4 — Courier/Delivery & Verification

### Delivery Modülü (MVP — manuel atama)
**Yeni modül:** `apps/backend/src/modules/delivery/`
- `domain/entities/delivery-dispatch.entity.ts` — orderId, courierId?, status (PENDING_ASSIGN, ASSIGNED, PICKED_UP, DELIVERED), pickedUpAt, deliveredAt
- `application/commands/dispatch-courier.handler.ts` — manuel atama (MVP) veya en yakın kurye (stub)
- `application/commands/mark-picked-up.handler.ts` — `OUT_FOR_DELIVERY`
- **3rd-party (sonraki sprint):** `IDeliveryProvider` interface; MVP `InternalDeliveryProvider`

### COMMERCE Tarafı
Değişmiyor: `trackingNumber` + `shippingCarrier` aynı handler'larla çalışır.

### Verification — End-to-End Manuel Test

```bash
pnpm docker:up
pnpm prisma:migrate dev --name vendor_type_restaurant
pnpm prisma:seed
pnpm dev
```

**Golden path:**
1. `/become-vendor` → Tip: **Restoran** → form submit
2. Admin `/admin/vendors` → APPROVE
3. Vendor login → `/vendor/dashboard` → sidebar "Menüler" + "Canlı Siparişler"
4. `/vendor/product-form` → Kategori "Pizza" (RESTAURANT) → ingredients, prepTime, calories görünür → shipping görünmez → Kaydet
5. Müşteri `/products` → menüyü gör → sepete ekle → checkout
6. Vendor `/vendor/orders` → "Mutfağa Al" → PREPARING → "Hazır Oldu" → READY
7. Vendor "Kuryeye Verildi" → OUT_FOR_DELIVERY → "Teslim Edildi" → DELIVERED

**Regression:**
8. Plus abonesi `/menu/index` → restoran listing → `PurchaseMenuCommand` → QR satın al → `/partner/menu-redeem` ile tara → MenuPurchase çalışıyor
9. COMMERCE vendor → "Elektronik" kategorisi → form RESTAURANT alanlarını göstermiyor → normal kargo akışı

**Otomatik:**
- `pnpm test` — yeni handler spec'leri
- `pnpm lint` — `any` ve `console.*` ihlali yok
- `pnpm build` — TypeScript strict ✅

---

## Kritik Dosyalar (Toplam)

### Backend
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/migrations/<new>/migration.sql`
- `apps/backend/prisma/seed.ts`
- `apps/backend/src/modules/vendor/domain/entities/vendor.entity.ts`
- `apps/backend/src/modules/vendor/domain/value-objects/restaurant-profile.vo.ts` *(yeni)*
- `apps/backend/src/modules/vendor/application/commands/register-vendor.{command,handler}.ts`
- `apps/backend/src/modules/vendor/application/commands/update-restaurant-settings.{command,handler}.ts` *(yeni)*
- `apps/backend/src/modules/vendor/presentation/dto/register-vendor.dto.ts`
- `apps/backend/src/modules/vendor/presentation/vendor.controller.ts`
- `apps/backend/src/modules/catalog/application/services/listing-validator.service.ts` *(yeni)*
- `apps/backend/src/modules/catalog/application/commands/create-listing.handler.ts`
- `apps/backend/src/modules/catalog/domain/entities/listing.entity.ts`
- `apps/backend/src/modules/commerce/domain/enums/order-status.enum.ts`
- `apps/backend/src/modules/commerce/domain/entities/order.entity.ts`
- `apps/backend/src/modules/commerce/application/commands/mark-order-preparing.{command,handler}.ts` *(yeni)*
- `apps/backend/src/modules/commerce/application/commands/mark-order-ready.{command,handler}.ts` *(yeni)*
- `apps/backend/src/modules/commerce/application/services/checkout.service.ts`
- `apps/backend/src/modules/commerce/presentation/order.controller.ts`
- `apps/backend/src/modules/menu/application/commands/purchase-menu.handler.ts`
- `apps/backend/src/modules/menu/application/commands/redeem-menu.handler.ts`
- `apps/backend/src/modules/delivery/**` *(yeni modül)*

### Frontend
- `apps/frontend/pages/vendor-application.vue`
- `apps/frontend/components/vendor/application/StepVendorType.vue` *(yeni)*
- `apps/frontend/components/vendor/application/StepBankCategories.vue`
- `apps/frontend/composables/useVendorApplication.ts`
- `apps/frontend/composables/useVendor.ts`
- `apps/frontend/composables/useOrderStatusLabel.ts` *(yeni)*
- `apps/frontend/composables/useProductForm.ts`
- `apps/frontend/components/layout/vendor/VendorSidebar.vue`
- `apps/frontend/components/forms/ProductForm.vue`
- `apps/frontend/components/forms/product/ProductFormAttributes.vue`
- `apps/frontend/components/forms/product/ProductFormInventory.vue`
- `apps/frontend/components/forms/product/ProductFormLogistics.vue`
- `apps/frontend/pages/vendor/orders.vue`
- `apps/frontend/pages/vendor/settings.vue`
- `apps/frontend/pages/vendor/dashboard.vue`

### Yeniden Kullanılacak Mevcut Yapılar
- `Listing.metadata` (Json) — restaurant attributes için (ek alan gerekmez)
- `CategoryAttribute` — dinamik form alanı sistemi (`ProductFormAttributes.vue` zaten kullanıyor)
- `Order.transitionTo()` — state machine (sadece map güncellenir)
- `vendor-application.vue` 3-step stepper — sadece bir adım eklenir
- `useProductForm` composable — adım listesi `computed`'ı revize edilir
- `MenuPurchase` + `MenuRedemption` — sadece FK rename, mantık aynı

---

## CLAUDE.md Güncellemesi

Her faz tamamlandığında `CLAUDE.md` → "📜 Architecture Stabilization History" bölümüne yeni başlık altında özet eklenecek.
