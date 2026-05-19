# BazarX — Proje Haritası (Master Referans)

> Bu dosyayı konuşmanın başına yapıştır. "auth diyorum" → bu dosyadaki auth bölümüne bak.
> Token tasarrufu: dosya okumadan önce buraya bak, yoksa sor.

---

## Mimari Özeti

```
monorepo (pnpm workspaces + turbo)
├── apps/
│   ├── backend/          NestJS, DDD/CQRS, Mongoose, port 3001
│   ├── frontend/         Nuxt 3 SPA, Pinia, port 3002
│   ├── financial-service/ gRPC microservice (cüzdan/escrow)
│   └── delivery-service/ ayrı servis (MongoDB)
├── packages/
│   ├── domain-identity/  User/Auth domain logic (shared package)
│   └── shared/
│       ├── shared-core       Result<T>, Entity base, Value Object base
│       ├── shared-types      DTO tipleri (frontend+backend ortak)
│       ├── shared-security   JwtAuthGuard, RolesGuard, SharedSecurityModule
│       ├── shared-persistence MongooseService, base repository
│       ├── shared-messaging  RabbitMQ modülü
│       ├── shared-queue      BullMQ tanımları
│       ├── shared-nest       Dekoratörler (@CurrentUser, @Roles)
│       └── shared-observability Health check, logger
└── infra/  docker-compose, nginx
```

**Veritabanı:** MongoDB + Mongoose  
**Cache:** Redis  
**Queue:** RabbitMQ + BullMQ  
**Storage:** MinIO (production), local (dev)  
**Auth:** JWT (access + refresh) + Google OAuth  
**Global guard:** JwtAuthGuard tüm uygulamaya uygulanmış (`APP_GUARD`)

> ⚠️ **ORM:** Mongoose kullanılır. Prisma, PostgreSQL, SQL migration kavramları bu projede geçersizdir.
> Para değerleri `Decimal128` tipinde tutulur. Transactions için MongoDB replica set zorunludur.

---

## Backend Modülleri — Dosya Referansı

### 🔐 IDENTITY (18 dosya — stabilize edildi)
**Ne yapar:** Kullanıcı kaydı, login, JWT, Google OAuth, profil, adres yönetimi, admin kullanıcı işlemleri  
**Domain package:** `packages/domain-identity/` — tüm komutlar/handler'lar orada  
**Backend'deki kısım:** Sadece controller katmanı + IdentityModule

| Dosya | Görev |
|-------|-------|
| `auth.controller.ts` | POST /auth/register, /auth/login, /auth/refresh, /auth/logout — login'de `@Throttle(5/60s)` ✅ |
| `google-oauth.controller.ts` | GET /auth/google, /auth/google/callback |
| `profile.controller.ts` | GET/POST /identity/profile, POST /identity/profile/change-password |
| `address.controller.ts` | CRUD /addresses |
| `user.controller.ts` | GET /users/me |
| `presentation/admin-user.controller.ts` | Admin: kullanıcı listele/sil/rol değiştir |
| `infrastructure/auth/auth.service.ts` | Token üretimi, refresh rotation, session yönetimi |
| `infrastructure/auth/token.service.ts` | JWT üret/doğrula, Redis blacklist |

**Mongoose modelleri:** `User`, `UserProfile`, `UserAddress`, `RefreshToken`, `VerificationToken`, `LoginHistory`, `Session`, `SSOToken`

---

### 📦 CATALOG (~88 dosya — temizlendi)
**Ne yapar:** Ürün kataloğu, kategori, marka, listing, review, favori, toplu import

**Kritik kavramlar:**
- `CatalogProduct` = master ürün
- `Listing` = satıcının fiyat/stok kaydı
- `Brand` = marka
- `Category` = ağaç yapısı

| Endpoint | Controller | Query/Command |
|----------|-----------|--------------|
| `GET /products` | `CatalogProductController` | `GetCatalogProductsQuery` |
| `GET /products/slug/:slug` | `CatalogProductController` | `GetCatalogProductBySlugQuery` |
| `GET /listings` | `ListingController` | `ListCatalogListingsHandler` |
| `GET /categories/tree` | `CategoryController` | `GetCategoryTreeHandler` |
| `GET /brands` | `BrandController` | `GetBrandsHandler` |
| `POST /admin/products/bulk-import` | `ProductAdminController` | `QueueImportProductsCommand` → BullMQ |

**Mongoose modelleri:** `CatalogProduct`, `CatalogModel`, `Listing`, `ListingImage`, `ListingPriceHistory`, `ListingStats`, `ListingAnalytic`, `Category`, `CategoryAttribute`, `Brand`, `BrandViolation`, `Collection`, `CollectionProduct`, `ProductMedia`, `ProductType`, `Review`, `Favorite`, `ImportJob`

---

### 🛒 COMMERCE (47 dosya — temizlendi)
**Ne yapar:** Sepet, checkout, sipariş, ödeme, fatura, iade, erken ödeme

| Dosya | Görev |
|-------|-------|
| `cart.controller.ts` | POST/GET/PATCH/DELETE /cart |
| `checkout.controller.ts` | POST /checkout |
| `order.controller.ts` | GET /orders, /orders/:id |
| `order-admin.controller.ts` | GET /admin/orders, /admin/orders/:id |
| `payment.controller.ts` | POST /payments/* |
| `return.controller.ts` | POST /orders/:id/return, GET /orders/:id/return — **⬜ implement edilmeli** |
| `early-payment.controller.ts` | POST /vendors/me/early-payment — **⬜ implement edilmeli** |
| `application/services/checkout.service.ts` | Transaction + hold/refund akışı |
| `application/services/invoice-pdf.service.ts` | PDF fatura üretimi (pdfkit) → **⬜ e-fatura entegrasyonu** |
| `application/services/return.service.ts` | İade akışı, kargo kodu üretimi — **⬜ implement edilmeli** |
| `application/services/early-payment.service.ts` | Erken ödeme faiz hesabı — **⬜ implement edilmeli** |
| `application/services/storage.service.ts` | Fatura PDF'leri MinIO'ya kaydeder |

**⬜ Yeni Mongoose modelleri:** `ReturnRequest`, `ReturnItem`, `EarlyPaymentRequest`

**Mevcut Mongoose modelleri:** `Cart`, `CartItem`, `Order`, `OrderItem`, `OrderStatusHistory`, `OrderReturn`, `Invoice`, `InvoiceItem`, `Dispute`, `StockReservation`, `EscrowCoupon`, `Coupon`

---

### 📦 İADE YÖNETİMİ — Yeni Modül ⬜
**Ne yapar:** 14 günlük yasal cayma hakkı, iade talebi akışı, otomatik kargo kodu, satıcı/admin onayı

**İş kuralları:**
- Müşteri teslimden itibaren **14 gün** içinde iade açabilir (Mesafeli Satış Yönetmeliği zorunluluğu)
- İade talebi açıldığında sistem otomatik kargo kodu üretir
- Satıcı **48 saat** içinde onay/red vermeli; yanıt yoksa iade otomatik onaylanır
- Red gerekçesi mevzuata aykırıysa sipariş tutarı satıcıdan tahsil edilir
- İade onayında finansal geri ödeme gRPC escrow üzerinden tetiklenir

**State Machine:**
```
REQUESTED → APPROVED / REJECTED
APPROVED  → CARGO_PENDING → RECEIVED → REFUND_INITIATED → COMPLETED
REJECTED  → (müşteri itiraz açabilir → DISPUTED)
```

**Yeni endpoint'ler:**
```
POST /orders/:id/return          ← müşteri iade talebi açar
GET  /orders/:id/return          ← iade durumu
POST /orders/:id/return/approve  ← satıcı onaylar (48s timeout)
POST /orders/:id/return/reject   ← satıcı reddeder (gerekçe zorunlu)
GET  /admin/returns              ← admin iade listesi
POST /admin/returns/:id/arbitrate ← admin müdahale
```

**Mongoose index'leri:**
```
ReturnRequest: { orderId: 1 } unique, { status: 1, createdAt: -1 }, { vendorId: 1, status: 1 }
```

---

### 💳 ERKEN ÖDEME — Yeni Modül ⬜
**Ne yapar:** Satıcı hakedişini vade öncesi çekebilir; platform faiz/kesinti karşılığı ödemeyi anında yapar

**İş kuralları:**
- Satıcı onaylı siparişlerinin toplam hakedişinin **en fazla %80'ini** erken çekebilir
- Erken ödeme faizi: `hakedişGünü - bugün` gün başına **günlük %0.05** (ayarlanabilir)
- Minimum erken ödeme tutarı: **500 ₺**
- Günde **1** erken ödeme talebi (aynı gün birden fazla yapılamaz)
- Onay anında finansal servis gRPC üzerinden transfer tetiklenir

**Yeni endpoint'ler:**
```
GET  /vendors/me/early-payment/eligible  ← çekilebilir bakiye ve faiz simülasyonu
POST /vendors/me/early-payment           ← talep oluştur
GET  /vendors/me/early-payment/history   ← geçmiş talepler
```

---

### ⭐ SATICI PUANLAMA VE İHLAL SİSTEMİ — Yeni Modül ⬜
**Ne yapar:** Satıcı skorunu hesaplar, kural ihlallerini puanlar, eşik aşımında hesabı kısıtlar/kapatır

**Puan Bileşenleri:**

| Kriter | Ağırlık | Ölçüm |
|--------|---------|-------|
| Zamanında kargo | %35 | Son 30 günde kargoya verme SLA uyumu |
| İptal oranı | %25 | Satıcı kaynaklı iptal / toplam sipariş |
| İade oranı | %20 | Satıcı kusurundan iade / toplam sipariş |
| Müşteri puanı | %20 | Ürün yorumları ortalaması (1–5 yıldız) |

**İhlal Kademeleri:**

| Puan | Durum | Aksiyon |
|------|-------|---------|
| 80–100 | ✅ İyi | Normal |
| 60–79 | ⚠️ Uyarı | Bildirim gönderilir |
| 40–59 | 🔴 Kritik | Yeni ürün ekleme kısıtlanır |
| 0–39 | ❌ Askıya alındı | Satış durdurulur, admin incelemesi |

- İhlal puanı **3 iş günü** itiraz hakkı tanır
- Puan hesabı **event-driven** (RabbitMQ): sipariş tamamlandığında, iade açıldığında, yorum geldiğinde tetiklenir
- Satıcı ihlal geçmişi `VendorAuditLog` collection'ına yazılır

**Yeni endpoint'ler:**
```
GET /vendors/me/score              ← güncel puan ve bileşenler
GET /vendors/me/violations         ← ihlal geçmişi
POST /vendors/me/violations/:id/appeal ← itiraz
GET /admin/vendors/low-score       ← düşük puanlı satıcılar
```

**Yeni Mongoose modelleri:** `VendorScore`, `VendorViolation`, `VendorScoreHistory`

---

### 🚚 KARGO TAKİP — Yeni Modül ⬜
**Ne yapar:** Kargo firması API entegrasyonu, gerçek zamanlı durum takibi, müşteriye otomatik bildirim

**Desteklenecek Kargo Firmaları (MVP):**
- MNG Kargo
- Yurtiçi Kargo
- Sürat Kargo
- Trendyol Express (TEX)

**Entegrasyon mimarisi:**
```
Order kargoya verilir
  → CargoService.createShipment(carrier, order)
  → carrier API'sine tracking no alınır
  → Order.trackingNumber + Order.shippingCarrier güncellenir
  → Polling scheduler (her 2 saat) durum sorgular
  → Durum değişikliğinde RabbitMQ event → müşteriye push/SMS bildirimi
```

**Kargo Durum State Machine:**
```
LABEL_CREATED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED / FAILED
```

- `ICargoProvider` interface — her firma ayrı adapter ile implement eder
- `CargoWebhookController` — firmalar durum değişikliğini webhook ile bildirebilir
- Webhook olmayan firmalar için `CargoPollingScheduler` (BullMQ repeatable job)

**Yeni endpoint'ler:**
```
GET  /orders/:id/tracking          ← adım adım kargo durumu
POST /orders/:id/tracking/refresh  ← manuel güncelle
GET  /admin/cargo/providers        ← aktif kargo firmaları
```

**Yeni Mongoose modelleri:** `CargoShipment`, `CargoStatusHistory`, `CargoProvider`

---

### 🏆 BUYBOX MEKANİZMASI — Yeni Modül ⬜
**Ne yapar:** Aynı ürünü satan birden fazla satıcı varsa en iyi teklife sahip satıcıyı öne çıkarır

**Buybox Skoru Bileşenleri:**

| Kriter | Ağırlık | Açıklama |
|--------|---------|----------|
| Fiyat | %40 | En düşük toplam fiyat (ürün + kargo) |
| Satıcı puanı | %30 | `VendorScore` değeri |
| Teslimat hızı | %20 | Ortalama kargoya verme süresi (gün) |
| Stok güvenilirliği | %10 | Son 30 günde stok tükenme oranı |

- Buybox skoru `CatalogProduct` bazında hesaplanır, her `Listing` için ayrı
- Hesaplama **event-driven**: fiyat değiştiğinde, puan güncellendiğinde tetiklenir
- Buybox kazanan `Listing.isBuyboxWinner: true` olarak işaretlenir
- Ürün sayfası varsayılan olarak buybox kazananı gösterir; diğer satıcılar "X satıcıdan daha ucuzu var" bölümünde listelenir

**Yeni endpoint'ler:**
```
GET /products/:id/offers           ← tüm satıcı teklifleri + buybox skoru
GET /listings/:id/buybox-status    ← satıcı kendi buybox durumunu görür
```

**Yeni Mongoose modelleri:** `BuyboxScore`, `BuyboxHistory`

---

### 🧾 OTOMATİK E-FATURA — Mevcut Modül Geliştirmesi ⬜
**Ne yapar:** Sipariş tamamlandığında mevcut `InvoicePdfService`'i e-fatura/e-arşiv ile entegre eder

**Mevcut durum:** `invoice-pdf.service.ts` PDF üretiyor, MinIO'ya kaydediyor. Müşteriye manuel gönderim yok.

**Hedef durum:**
- Sipariş `DELIVERED` olduğunda otomatik e-arşiv fatura üretilir
- GİB uyumlu fatura XML formatında imzalanır (entegratör: Logo, Paraşüt, veya Efatura.com API)
- PDF + XML MinIO'ya kaydedilir
- Müşteriye e-posta + uygulama bildirimiyle iletilir
- Satıcı kendi faturalarını `GET /vendors/me/invoices` ile indirebilir

**Entegrasyon Noktaları:**
```
Order → DELIVERED event (RabbitMQ)
  → InvoiceService.generateEInvoice(order)
  → EInvoiceProvider.submit(xml)        ← IEInvoiceProvider interface
  → MinIO'ya kaydet
  → NotificationService.send(customer, invoice)
```

**Yeni ENV:**
```
EINVOICE_PROVIDER=efatura          # efatura | logo | parasut
EINVOICE_API_KEY=...
EINVOICE_API_SECRET=...
```

**Mongoose index'leri:** `Invoice: { orderId: 1 } unique, { vendorId: 1, createdAt: -1 }`

---

### 🏪 VENDOR (104 dosya — temizlendi)
**Ne yapar:** Satıcı kaydı/onay, şirket, ürün, ekosistem, B2B, gösterge paneli

**Kritik kavramlar:**
- `Vendor` = satıcı hesabı
- `Company` = şirket bilgisi (PENDING → APPROVED)
- `BrandEcosystem` = marka ekosistemi
- `EcosystemMembership` = fabrika → bayi ilişkisi (unique index: `{ dealerId: 1 }`)

**Önemli akışlar:**
1. Vendor başvuru: `POST /vendors/apply-atomic` → `VendorRegistrationService.registerAtomic()` → tek Mongoose session'da company + vendor + profile + settings + bank account
2. Admin onay: `PUT /admin/vendors/:id/approve` → `ApproveVendorHandler` → event yayıyor
3. Ürün: `POST /vendors/products` → `CreateVendorProductHandler`

**Mongoose modelleri:** `Vendor`, `VendorProfile`, `VendorSettings`, `VendorBankAccount`, `VendorStats`, `VendorMetrics`, `VendorFollower`, `VendorBanner`, `VendorCategory`, `VendorB2BData`, `Company`, `CompanyUser`, `BrandEcosystem`, `EcosystemMembership`, `EcosystemAuditLog`, `Transfer`, `TransferItem`, `VendorScore`, `VendorViolation`, `VendorScoreHistory`

---

### 🔄 BARTER (36 dosya — temizlendi)
**Ne yapar:** Takas sistemi — surplus ürün ekle, eşleştir, takas teklifi, swap session

**Kritik kavramlar:**
- `SurplusItem` = kullanıcının takas için koyduğu ürün (`matchPreference` zorunlu alan)
- `WantedItem` = kullanıcının istediği ürün
- `TradeOffer` = takas teklifi (TTL index: `expiresAt`)
- `SwapSession` = onaylanmış takas süreci (`deadlineAt` index)
- `DemandMatch` = eşleştirme sonucu
- `BatchMatchLog` = batch matching audit kaydı

| Dosya | Görev |
|-------|-------|
| `presentation/barter-admin.controller.ts` | `GET/POST/PATCH/DELETE /admin/barter/*` |
| `application/commands/accept-trade-offer.handler.ts` | Mongoose session + SwapSession oluşturma + RabbitMQ event |
| `application/commands/create-surplus-item.handler.ts` | SurplusItem domain entity oluşturma |
| `application/services/matching.service.ts` | Kategori/keyword/fiyat/konum bazlı eşleştirme skoru |
| `application/services/collateral-calculator.service.ts` | Teminat hesaplama (domain VO) |
| `application/services/barter-match.service.ts` | `runDailyBatch()` — batch matching engine |
| `application/schedulers/barter-match.scheduler.ts` | 02:00 cron tetikleyici |
| `application/schedulers/swap-session.scheduler.ts` | `checkTimeouts()` — deadline taraması |
| `domain/services/trade-state-machine.service.ts` | TradeOffer durum geçişleri |

**MongoDB index'leri:**
```
SurplusItem:       { status: 1, trustScore: -1, createdAt: 1 }
TradeOffer:        { expiresAt: 1 } ← TTL index (expireAfterSeconds: 0)
SwapSession:       { deadlineAt: 1 }
BatchMatchLog:     { runAt: -1 }
```

**Mongoose modelleri:** `SurplusItem`, `SurplusCategory`, `WantedItem`, `TradeOffer`, `TradeOfferItem`, `SwapSession`, `TradeMatch`, `TradeChain`, `TradeCompletion`, `TradeReview`, `DemandMatch`, `BarterPart`, `BarterDisputeLog`, `BatchMatchLog`

---

### 🏭 ECOSYSTEM (Fabrika) — Yeni Modül
**Ne yapar:** Fabrika → Bayi ekosistemi, ürün gamı, Garaj Günü, Watchover kota kontrolü

| Dosya | Görev |
|-------|-------|
| `ecosystem.controller.ts` | Fabrika: ürün gamı, Garaj Günü CRUD |
| `dealer.controller.ts` | Bayi: sipariş, kota sorgulama |
| `application/services/watchover.service.ts` | Kota kontrolü (aggregate + atomic) |
| `application/services/garage-sale.service.ts` | Flash sale, `$inc soldQty`, status geçişi |

**Mongoose modelleri:** `EcosystemProduct`, `EcosystemOrder`, `GarageSale`, `ProductVisibility`

**MongoDB index'leri:**
```
EcosystemMembership: { dealerId: 1 } ← unique
EcosystemProduct:    { factoryId: 1, 'visibility.availableFrom': 1 }
GarageSale:          { factoryId: 1, status: 1, startsAt: 1, endsAt: 1 }
EcosystemOrder:      { dealerId: 1, productId: 1 }
```

---

### 🔨 AUCTION (18 dosya — stabilize edildi)
**Ne yapar:** Açık artırma + piyango sistemi

**Mongoose modelleri:** `Auction`, `AuctionBid`, `AuctionParticipation`, `AuctionWinner`, `Lottery`, `LotteryTicket`

---

### 📢 ADVERTISING (23 dosya — temizlendi)
**Mongoose modelleri:** `AdCampaign`, `AdSlot`, `SideAd`, `AdCampaignMetric`

---

### 💰 FINANCIAL-GATEWAY (21 dosya — temizlendi)
**Ne yapar:** Cüzdan API köprüsü — backend ↔ financial-service (gRPC)

| Dosya | Görev |
|-------|-------|
| `wallet.controller.ts` | GET /wallet, /wallet/transactions, POST /wallet/topup, /wallet/withdraw |
| `wallet-admin.controller.ts` | GET/POST /admin/wallet/* |
| `financial-gateway.service.ts` | gRPC çağrıları orchestrate eder |
| `grpc/wallet-grpc.service.ts` | financial-service'e gRPC bağlantısı |
| `grpc/escrow-grpc.service.ts` | Escrow hold/release/refund |

---

### 🎯 LOYALTY (temizlendi)
**Mongoose modelleri:** `MembershipTier`, `UserLevel`, `LoyaltyTierHistory`, `XpTransaction`, `XpBatch`, `XpDistributionRule`, `XpSpendingLimitRule`, `Mission`, `UserMission`, `MilestoneTracker`, `PlatinumMissionLog`

---

### 💬 COMMUNICATION (54 dosya — temizlendi)
**Mongoose modelleri:** `ChatRoom`, `ChatMessage`, `Notification`, `UserComplaint`

---

### 📝 CONTENT (50 dosya — temizlendi)
**Mongoose modelleri:** `HomeBanner`, `HomeQuadCard`, `HomeQuadCardItem`, `HelpArticle`, `HelpCategory`, `Announcement`, `Policy`, `SeoMetadata`, `DynamicContent`, `SideAd`

---

### 📊 ANALYTICS (11 dosya — temizlendi)
**Mongoose modelleri:** `AnalyticsEvent`, `ListingAnalytic`, `ProductActivity`

---

### 🖼️ MEDIA (9 dosya — temizlendi)
**URL yapısı:** `https://storage.bazarx.com/bazarx-media/{subPath}/{uuid}/{size}.webp`

---

### 📦 INVENTORY (8 dosya — temizlendi)
**Mongoose modelleri:** `Stock`, `Warehouse`, `InventoryLog`, `PurchaseOrder`, `PurchaseOrderItem`

---

### 🎯 MARKETING (5 dosya — temizlendi)
**Mongoose modelleri:** `Campaign`, `GroupBuy`, `GroupBuyParticipant`, `GiftCard`, `Coupon`, `CouponUsage`

---

## Frontend Yapısı

### Sayfa → Composable → Service Haritası

| Alan | Pages | Composable | API Service |
|------|-------|-----------|------------|
| Auth | `auth/*` | — | `AuthService.ts` |
| Ürün | `products/*` | `useProductDetail`, `useProductFilters` | `ProductService.ts` |
| Sepet | `cart` | `useCartPage` | `CartService.ts` |
| Checkout | `checkout` | `useCheckout` | — |
| Takas | `barter/*`, `my/surplus/*` | `useSurplus`, `useTradeOffer`, `useSwapSession` | `BarterService.ts` |
| Vendor | `vendor/*` | `useVendorDashboard`, `useVendorEcosystem` | `VendorService.ts` |
| Admin | `admin/*` | `useAdmin*` (20+) | `AdminProductService.ts` |

### Pinia Store'ları
`auth`, `cart`, `chat`, `adminChat`, `auction`, `lottery`, `notification`, `wishlist`, `address`, `siteSettings`

### Middleware
`auth`, `admin`, `vendor`, `super-admin`, `ecosystemGuard`

---

## Canlıya Alma Yol Haritası

### ✅ Tamamlanan Fazlar (1-5)
Tüm mimari stabilizasyon, güvenlik, modül temizliği, performans/infra, test/CI işleri tamamlandı.

### Faz 6 — MongoDB Geçişi (Aktif)
```
[ ] Prisma schema → Mongoose schema dönüşümü (tüm modüller)
[ ] SQL migration'lar → Mongoose index script'leri
[ ] PrismaService → MongooseService (shared-persistence)
[ ] Repository'ler Mongoose Model injection ile güncellenmeli
[ ] MongoDB replica set kurulumu (transactions için zorunlu)
[ ] shared-persistence package'ı MongooseModule export edecek şekilde güncellenmeli
```

### Faz 7 — Barter Engine (Sıradaki)
```
[ ] MatchPreference alanı SurplusItem schema'sına eklenmeli
[ ] BarterMatchScheduler + runDailyBatch()
[ ] SwapSchedulerService.checkTimeouts()
[ ] Escrow blokaj gRPC entegrasyonu
[ ] TrustScore service
[ ] Fabrika Ekosistemi modülü
[ ] TTL index'leri: TradeOffer.expiresAt, SwapSession.deadlineAt
```

---

## Sık Kullanılan Komutlar

```bash
# Dev başlat
pnpm dev
pnpm --filter backend dev
pnpm --filter frontend dev

# MongoDB
pnpm --filter backend mongoose:sync-indexes   # index'leri sync et

# Build
pnpm build
pnpm --filter backend build

# Test
pnpm --filter backend test
pnpm --filter frontend test:e2e
```

---

## Kısa Sözlük

| Terim | Ne demek |
|-------|----------|
| CatalogProduct | Master ürün tanımı |
| Listing | Satıcının fiyat/stok kaydı |
| SurplusItem | Takas için konulan ürün (`matchPreference` zorunlu) |
| SwapSession | Onaylanmış takas oturumu |
| BrandEcosystem | Marka altındaki satıcı grubu |
| EcosystemMembership | Fabrika → Bayi bağlantısı (unique dealerId) |
| GarageSale | Fabrika flash sale kampanyası |
| XP | Deneyim puanı (sadakat sistemi) |
| MembershipTier | Üyelik seviyesi (CORE/PRIME/ELITE/APEX) |
| ImportJob | Excel bulk import'un async job kaydı |
| BatchMatchLog | Barter batch matching audit kaydı |
| shared-core/Result | `Ok(data) \| Err(error)` — tüm handler dönüş tipi |
