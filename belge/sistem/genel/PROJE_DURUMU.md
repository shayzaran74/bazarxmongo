# BazarX / BarterBorsa — Proje Durum Kılavuzu
> Bu dosyayı yeni konuşmada Claude'a ver: "Bu dosyayı oku, nerede kaldığımızı bilmeni istiyorum."

---

## Proje Kimliği

| | |
|---|---|
| **Ad** | BazarX / BarterBorsa / TicariTakas |
| **Tip** | Fullstack monorepo — hibrit e-ticaret + barter platformu |
| **Stack** | NestJS (backend) · Nuxt 3 + Vue 3 + Pinia + Tailwind (frontend) |
| **Altyapı** | **MongoDB + Mongoose** · Redis · RabbitMQ · MinIO · gRPC (financial-service) |
| **Pattern** | DDD / CQRS / Hexagonal Architecture |
| **ORM** | **Mongoose** (Prisma kaldırıldı) |
| **Paket yöneticisi** | pnpm workspaces |

---

## Monorepo Yapısı

```
/
├── apps/
│   ├── backend/          ← NestJS API (port 3001)
│   ├── frontend/         ← Nuxt 3 SPA (port 3002, SSR: false)
│   └── financial-service/ ← gRPC wallet servisi (port 50051)
├── packages/
│   ├── shared-types/     ← @barterborsa/shared-types
│   └── shared-persistence/ ← @barterborsa/shared-persistence (MongooseService)
```

---

## Backend — Tamamlanan İşler

### Mimari Kurallar (Tüm Modüllerde Geçerli)
- Controller'larda `MongooseModel` sıfır — tüm DB işlemleri repository'lerde
- `CommandBus` + `QueryBus` her controller'da
- Tip-safe Mongoose query'ler — `any` kullanımı yasak
- `console.*` sıfır — `Logger` kullanılıyor
- Para hesapları `Decimal128` + `Money` API — JavaScript `number` yasak
- Transactions `mongoose.startSession()` + `session.withTransaction()` ile

### Tamamlanan Fazlar
```
✅ B1    vendor.controller.ts CQRS (VendorRegistrationService, GetVendorProductsQuery vb.)
✅ SM    Schema: Invoice, InvoiceItem, Order.user relation, InventoryLog.reason (Mongoose)
✅ 4A    Catalog + VendorProduct controller'ları + PassthroughMediaService
✅ 4B    Ecosystem, Analytics, VendorBanners, Ads stub controller'ları
✅ B2    Identity: AdminUserController, AuthService temizliği
✅ C1-C3 VendorAdminController, ProductAdminController, BrandAdminController
✅ 4C    Commerce: CartController, CheckoutService, MongooseOrderRepository
✅ Faz 5 Invoice: InvoiceNumber VO, PDFKit, StorageService, GenerateInvoiceCommand
✅ Faz 6 Wallet gRPC: financial.proto genişletildi, WalletGrpcService, WalletController
```

### Önemli Backend Dosya Yolları
```
apps/backend/src/modules/
  commerce/application/services/checkout.service.ts
  commerce/application/services/invoice-pdf.service.ts
  financial-gateway/financial-gateway.service.ts
  financial-gateway/wallet.controller.ts
  vendor/presentation/vendor.controller.ts
  catalog/presentation/listing.controller.ts
  identity/presentation/admin-user.controller.ts
```

---

## Frontend — Tamamlanan İşler

### Nuxt 3 Yapılandırması
- `SSR: false` (SPA modu)
- `useApi()` composable → `$api` ile tüm HTTP çağrıları
- BFF proxy: `/api/**` → `backend:3001` (dev: Nuxt proxy, prod: Nginx)
- Socket.io: polling → WebSocket upgrade, `ip_hash` sticky session

### Tamamlanan Section'lar
```
✅ S1-S6  Auth, Products, Vendor, Cart, Barter, Profile (mevcut)
✅ S7     Auction + Lottery
✅ S8     Chat + Notifications
✅ S9     Admin Panel (19 composable)
✅ S10    Final Polish (17 composable)
```

### Önemli Frontend Notlar
- `placehold.co` → `/placeholder-product.svg` ve `/placeholder-avatar.svg` (yerel)
- Stripe → **Iyzico** (ödeme sistemi değişti)
- Font Awesome CDN → `components/common/SocialIcons.vue` (inline SVG)
- `useApi()` composable'ı `$api` döndürüyor, doğrudan `useFetch` kullanılmıyor

---

## Görsel Asset'ler — Tamamlandı

```
public/
  logo-bazarx.svg / .png
  logo-barterborsa.svg / .png
  favicon.svg / .ico
  icon-192x192.png / icon-512x512.png / apple-touch-icon.png
  og-image.svg / .png
  placeholder-product.svg / placeholder-avatar.svg
components/common/SocialIcons.vue
```

---

## E2E Testler — Tamamlandı

```
Framework: Playwright
apps/frontend/e2e/
  global.setup.ts
  checkout.spec.ts        (7 senaryo)
  vendor-registration.spec.ts (5 senaryo)
  auction-bid.spec.ts     (8 senaryo)
```

---

## Prod Altyapısı — Tamamlandı

```
docker-compose.prod.yml    ← 8 servis
nginx/nginx.conf           ← ip_hash upstream
nginx/conf.d/bazarx.conf   ← SSL, WebSocket upgrade
Dockerfile.frontend.prod   ← Multi-stage Nuxt build
Dockerfile.backend.prod    ← Multi-stage NestJS
scripts/deploy.sh          ← first / update / rollback / status
```

---

## ENV Dosyaları

```
apps/backend/
  .env.development   ← localhost, dev MongoDB, sandbox Iyzico
  .env.production    ← Docker servis adları, placeholder'lar doldurulacak
  .env.example

apps/frontend/
  .env.development   ← localhost:3001
  .env.production    ← bazarx.com, nginx proxy
  .env.example
```

**Kritik ENV değişkenleri (backend):**
```
MONGODB_URI=mongodb://mongo:27017/bazarx        # prod: replica set URI
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
RABBITMQ_URL=amqp://rabbitmq:5672
FINANCIAL_GRPC_URL=financial-service:50051
```

---

## GERÇEKTEN KALAN İŞLER

### Prod'a Çıkmadan Önce (Manuel)
```
[ ] .env.production placeholder'ları gerçek değerlerle doldur
    JWT_SECRET         → openssl rand -base64 64 | tr -d '\n'
    JWT_REFRESH_SECRET → openssl rand -base64 64 | tr -d '\n'
    MONGODB_URI        → MongoDB Atlas veya replica set bağlantı stringi
    MONGODB_PASSWORD   → güçlü şifre
    REDIS_PASSWORD     → openssl rand -base64 24 | tr -d '\n'
    IYZICO_API_KEY     → merchant.iyzipay.com canlı key
    IYZICO_SECRET_KEY  → merchant.iyzipay.com canlı key
    GOOGLE_CLIENT_ID   → Google Cloud Console canlı credentials

[ ] nginx/conf.d/bazarx.conf içindeki "bazarx.com" → gerçek domain
[ ] ./scripts/deploy.sh first  ← SSL + ilk kurulum
```

### Kod Tarafında Kalan
```
[ ] Iyzico ödeme entegrasyonu canlı testi
    Test kartı: 5528790000000008, CVV: 123, SKT: 12/30

[ ] NestJS main.ts CORS + Socket.io gateway CORS prod domain'i
    app.enableCors({ origin: process.env.FRONTEND_URL })
    @WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL } })

[ ] MongoDB index'leri prod'da oluşturulmalı
    Mongoose syncIndexes() veya manuel index migration scripti çalıştırılmalı

[ ] MinIO bucket'ı public yapılmalı
    mc anonymous set public local/bazarx-media

[ ] MongoDB replica set kurulumu (transactions için zorunlu)
    Tek node'da transaction çalışmaz — en az 1-node replica set başlatılmalı:
    rs.initiate()
```

### Barter Sistemi — Kalan İşler
```
[ ] MatchPreference alanı SurplusItem Mongoose schema'sına eklenmeli
[ ] BarterMatchScheduler + runDailyBatch() implement edilmeli
[ ] SwapSchedulerService.checkTimeouts() implement edilmeli
[ ] SwapSession açılışında %20 escrow blokajı gRPC entegrasyonu
[ ] TrustScore service (event-driven, RabbitMQ consumer)
[ ] EcosystemMembership + ProductVisibility + GarageSale Mongoose schema'ları
[ ] AnonymousId katmanı (SwapSession chat anonimleştirme)
[ ] MongoDB TTL index'leri: TradeOffer.expiresAt, SwapSession.deadlineAt
```

### Yeni Özellikler — Kalan İşler (Trendyol Paritet)

```
[ ] İADE YÖNETİMİ
    ReturnRequest + ReturnItem Mongoose schema'ları
    return.controller.ts + return.service.ts
    POST /orders/:id/return, GET /orders/:id/return
    POST /orders/:id/return/approve|reject (48s timeout → auto-approve)
    Satıcı red → admin arbitration akışı
    Onay → escrow gRPC refund tetiklemesi
    Admin /admin/returns endpoint'i

[ ] SATICI PUANLAMA VE İHLAL SİSTEMİ
    VendorScore + VendorViolation + VendorScoreHistory Mongoose schema'ları
    VendorScoreService (event-driven, RabbitMQ consumer)
      → sipariş tamamlandığında, iade açıldığında, yorum geldiğinde tetiklenir
    4 bileşen: zamanında kargo %35, iptal %25, iade %20, yorum %20
    4 kademe: İyi / Uyarı / Kritik / Askıya alındı
    3 iş günü itiraz mekanizması
    GET /vendors/me/score, /vendors/me/violations
    GET /admin/vendors/low-score

[ ] KARGO TAKİP (MVP: MNG + Yurtiçi + Sürat + TEX)
    ICargoProvider interface + carrier adapter'ları
    CargoShipment + CargoStatusHistory + CargoProvider Mongoose schema'ları
    CargoPollingScheduler (BullMQ repeatable, 2 saatte bir)
    CargoWebhookController (webhook destekleyen firmalar için)
    Durum değişikliğinde RabbitMQ event → push/SMS bildirimi
    GET /orders/:id/tracking

[ ] ERKEN ÖDEME SİSTEMİ
    EarlyPaymentRequest Mongoose schema
    EarlyPaymentService: günlük %0.05 faiz, maks %80 hakediş, min 500₺
    GET /vendors/me/early-payment/eligible (simülasyon)
    POST /vendors/me/early-payment (talep)
    Onay → financial-service gRPC transfer

[ ] BUYBOX MEKANİZMASI
    BuyboxScore + BuyboxHistory Mongoose schema'ları
    BuyboxCalculatorService (event-driven)
      → fiyat değiştiğinde, puan güncellendiğinde tetiklenir
    4 bileşen: fiyat %40, satıcı puanı %30, teslimat hızı %20, stok %10
    Listing.isBuyboxWinner alanı eklenmeli
    GET /products/:id/offers, GET /listings/:id/buybox-status

[ ] OTOMATİK E-FATURA
    IEInvoiceProvider interface + entegratör adapter (efatura.com / Logo / Paraşüt)
    InvoiceService.generateEInvoice() — sipariş DELIVERED olduğunda RabbitMQ consumer
    GİB uyumlu XML üretimi + dijital imza
    PDF + XML MinIO'ya kaydet (bazarx-invoices bucket)
    Müşteriye e-posta + bildirim
    GET /vendors/me/invoices (satıcı fatura listesi)
    ENV: EINVOICE_PROVIDER, EINVOICE_API_KEY, EINVOICE_API_SECRET
```
```
[ ] PWA workbox cache stratejisi
[ ] Backend unit test coverage artırma
[ ] Rate limiting prod değerleri
[ ] Redis session store (multi-instance için)
```

---

## Kritik Teknik Kararlar (Unutma)

| Karar | Detay |
|-------|-------|
| **Prisma → Mongoose** | Tüm veri katmanı MongoDB + Mongoose. SQL migration yok, Mongoose schema + index yönetimi. |
| **MongoDB Transactions** | Replica set zorunlu. `mongoose.startSession()` + `session.withTransaction()`. |
| **Decimal128** | Para değerleri `Decimal128` tipinde tutulur, JS `number` kullanılmaz. |
| **İade 14 gün** | Mesafeli Satış Yönetmeliği gereği yasal zorunluluk. 48s satıcı timeout → auto-approve. |
| **Buybox event-driven** | Fiyat/puan değişikliğinde BullMQ job ile yeniden hesaplanır; kritik yolu bloklamaz. |
| **E-fatura entegratör** | IEInvoiceProvider interface — efatura.com / Logo / Paraşüt seçilebilir. GİB uyumlu XML zorunlu. |
| **Kargo polling** | Webhook desteklemeyen firmalar için BullMQ repeatable job, 2 saatte bir durum sorgusu. |
| Stripe → Iyzico | Ödeme sistemi değişti. Frontend'de Stripe ref'leri temizlendi. |
| SSR: false | Nuxt SPA modu. |
| Socket.io path | `/socket.io/` — Nginx bu path'i backend'e proxy'liyor. |
| ip_hash | Nginx upstream'de zorunlu — Socket.io sticky session için. |
| gRPC field numbers | ReleaseFunds/RefundFunds: `holdId=1, idempotencyKey=2` (düzeltildi). |
| PassthroughMediaService | `MEDIA_SERVICE` inject crash'ini önlüyor, catalog modülünde. |

---

## Hızlı Başlangıç Komutları

```bash
# Dev ortamı
pnpm install
pnpm --filter @bazarx/backend dev     # port 3001
pnpm --filter @bazarx/frontend dev    # port 3002

# MongoDB index sync (dev)
pnpm --filter @bazarx/backend mongoose:sync-indexes

# Build kontrolü
pnpm --filter @bazarx/backend build
pnpm --filter @bazarx/frontend build
pnpm --filter @bazarx/frontend typecheck

# E2E testler
cd apps/frontend && pnpm test:e2e

# Prod deploy
./scripts/deploy.sh first
./scripts/deploy.sh update
./scripts/deploy.sh status
```
