# BazarX / BarterBorsa — Proje Durum Kılavuzu
> Bu dosyayı yeni konuşmada Claude'a ver: "Bu dosyayı oku, nerede kaldığımızı bilmeni istiyorum."

---

## Proje Kimliği

| | |
|---|---|
| **Ad** | BazarX / BarterBorsa / TicariTakas |
| **Tip** | Fullstack monorepo — hibrit e-ticaret + barter platformu |
| **Stack** | NestJS (backend) · Nuxt 3 + Vue 3 + Pinia + Tailwind (frontend) |
| **Altyapı** | PostgreSQL · Redis · RabbitMQ · MinIO · gRPC (financial-service) |
| **Pattern** | DDD / CQRS / Hexagonal Architecture · Prisma ORM |
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
│   └── shared-persistence/ ← @barterborsa/shared-persistence (PrismaService)
```

---

## Backend — Tamamlanan İşler

### Mimari Kurallar (Tüm Modüllerde Geçerli)
- Controller'larda `PrismaService` sıfır — tüm DB işlemleri repository'lerde
- `CommandBus` + `QueryBus` her controller'da
- `(tx as any)` sıfır — `Prisma.TransactionClient` tip-safe
- `console.*` sıfır — `Logger` kullanılıyor

### Tamamlanan Fazlar
```
✅ B1    vendor.controller.ts CQRS (VendorRegistrationService, GetVendorProductsQuery vb.)
✅ SM    Schema: Invoice, InvoiceItem, Order.user relation, InventoryLog.reason
✅ 4A    Catalog + VendorProduct controller'ları + PassthroughMediaService
✅ 4B    Ecosystem, Analytics, VendorBanners, Ads stub controller'ları
✅ B2    Identity: AdminUserController, AuthService temizliği
✅ C1-C3 VendorAdminController, ProductAdminController, BrandAdminController
✅ 4C    Commerce: CartController, CheckoutService, PrismaOrderRepository
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
           stores/auction.ts, stores/lottery.ts
           composables/useAuctionOverview.ts, useAuctionDetail.ts, useMyAuctions.ts
           composables/useLottery.ts
           pages/lotteries/my.vue (yeni)
✅ S8     Chat + Notifications
           stores/chat.ts (Socket.io), stores/adminChat.ts
           stores/notification.ts
           services/api/ChatService.ts, AdminChatService.ts
           composables/useChat.ts, useNotifications.ts
           components/common/NotificationBell.vue
✅ S9     Admin Panel (19 composable)
           useAdminDashboard, useAdminUsers, useAdminVendors, useAdminOrders, useAdminProducts
           useAdminWallet, useAdminAuctions, useAdminLottery
           useAdminBrands, useAdminCategories, useAdminBanners, useAdminContent
           useAdminAuditLogs, useAdminChat, useAdminLedger, useAdminGroupBuy
           useAdminSideAds, useAdminPendingProducts, useAdminAdvertising
           useAdminEcosystems, useAdminHelp
✅ S10    Final Polish (17 composable)
           useCartPage, useCheckout, useVendorDashboard, useVendorOrders
           useVendorUsers, useVendorBrands, useVendorEcosystem
           useProductDetail, useProfile, useAppImage, useAds
           useAdminOrderDetail, useHomepageSettings, useHomeMenu, useHomeMenuItems
           useSurplusList, useSwapSession, useVendorApplication
```

### Önemli Frontend Notlar
- `placehold.co` → `/placeholder-product.svg` ve `/placeholder-avatar.svg` (yerel)
- Stripe → **Iyzico** (ödeme sistemi değişti, `NUXT_PUBLIC_STRIPE_*` kaldırıldı)
- Font Awesome CDN → `components/common/SocialIcons.vue` (inline SVG)
- `useApi()` composable'ı `$api` döndürüyor, doğrudan `useFetch` kullanılmıyor

---

## Görsel Asset'ler — Tamamlandı

```
public/
  logo-bazarx.svg / .png       ← mor/indigo, çanta ikonu
  logo-barterborsa.svg / .png  ← amber/turuncu, takas ok'ları
  favicon.svg / .ico
  icon-192x192.png             ← PWA manifest
  icon-512x512.png             ← PWA manifest
  apple-touch-icon.png
  og-image.svg / .png          ← 1200×630 sosyal medya
  placeholder-product.svg
  placeholder-avatar.svg
components/common/SocialIcons.vue  ← Font Awesome yerine inline SVG
```

---

## E2E Testler — Tamamlandı

```
Framework: Playwright
apps/frontend/
  playwright.config.ts
  e2e/
    global.setup.ts              ← user/admin/vendor auth state
    checkout.spec.ts             ← 7 senaryo
    vendor-registration.spec.ts  ← 5 senaryo
    auction-bid.spec.ts          ← 8 senaryo
  pages/
    CheckoutPage.ts              ← POM
    AuctionPage.ts               ← POM
    VendorRegistrationPage.ts    ← POM
  fixtures/api.fixtures.ts       ← Mock API response'ları
```

**data-testid Eklenen Component'ler:**
```
AuctionCard, AuctionBidding, AuctionBidHistory
CheckoutAddressForm, CheckoutPaymentMethod, CheckoutOrderSummary
ProductItem (data-testid="cart-item")
ApplicationStepper, RegistrationStatus
```

---

## Prod Altyapısı — Tamamlandı

```
docker-compose.prod.yml    ← 8 servis
nginx/nginx.conf           ← ip_hash upstream (Socket.io sticky session)
nginx/conf.d/bazarx.conf   ← SSL, WebSocket upgrade, /socket.io/ proxy
Dockerfile.frontend.prod   ← Multi-stage Nuxt build
Dockerfile.backend.prod    ← Multi-stage NestJS + prisma migrate
scripts/deploy.sh          ← first / update / rollback / status
```

**Socket.io Prod Bağlantı Akışı:**
```
Client → Nginx (/socket.io/) → ip_hash → backend:3001/socket.io/
stores/chat.ts: socketBase = window.location.origin (prod) veya apiBase (dev)
```

---

## ENV Dosyaları — Tamamlandı

```
apps/backend/
  .env.development   ← localhost, dev DB, sandbox Iyzico
  .env.production    ← Docker servis adları, placeholder'lar doldurulacak
  .env.example       ← git'e commit edilen şablon

apps/frontend/
  .env.development   ← localhost:3001
  .env.production    ← bazarx.com, nginx proxy
  .env.example       ← git'e commit edilen şablon
```

---

## GERÇEKTEN KALAN İŞLER

### Prod'a Çıkmadan Önce (Manuel)
```
[ ] .env.production placeholder'ları gerçek değerlerle doldur
    JWT_SECRET        → openssl rand -base64 64 | tr -d '\n'
    JWT_REFRESH_SECRET → openssl rand -base64 64 | tr -d '\n'
    POSTGRES_PASSWORD  → openssl rand -base64 32 | tr -d '\n'
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
    CheckoutPaymentMethod.vue'da #iyzico-form-container var
    Backend: iyzico checkout form endpoint'i doğrulanmalı
    Test kartı: 5528790000000008, CVV: 123, SKT: 12/30

[ ] NestJS main.ts CORS + Socket.io gateway CORS prod domain'i
    app.enableCors({ origin: process.env.FRONTEND_URL })
    @WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL } })

[ ] Prisma migration'ları prod DB'ye uygulanmalı
    docker compose exec backend npx prisma migrate deploy

[ ] MinIO bucket'ı public yapılmalı
    mc anonymous set public local/bazarx-media
```

### Opsiyonel / İleride
```
[ ] og-image.svg → .png (cairosvg ile yapıldı, kontrol et)
[ ] PWA workbox cache stratejisi fine-tuning
[ ] Backend unit test coverage artırma
    Mevcut: commerce, auction, barter, loyalty, advertising testleri var
    Eksik: identity, vendor, catalog, financial-gateway testleri
[ ] Rate limiting (ThrottlerModule) prod değerleri ayarlama
[ ] Redis session store (şu an in-memory, multi-instance için gerekli)
```

---

## Kritik Teknik Kararlar (Unutma)

| Karar | Detay |
|-------|-------|
| Stripe → Iyzico | Ödeme sistemi değişti. Frontend'de Stripe ref'leri temizlendi |
| SSR: false | Nuxt SPA modu. `useAsyncData` bazı vendor sayfalarında kullanılıyor |
| Socket.io path | `/socket.io/` — Nginx bu path'i backend'e proxy'liyor |
| ip_hash | Nginx upstream'de zorunlu — Socket.io sticky session için |
| Prisma multi-schema | `public` (core) + `financial` (financial-service) aynı DB'de |
| gRPC field numbers | ReleaseFunds/RefundFunds: `holdId=1, idempotencyKey=2` (düzeltildi) |
| placehold.co kaldırıldı | `/placeholder-product.svg` ve `/placeholder-avatar.svg` kullanılıyor |
| PassthroughMediaService | `MEDIA_SERVICE` inject crash'ini önlüyor, catalog modülünde |

---

## Hızlı Başlangıç Komutları

```bash
# Dev ortamı
pnpm install
pnpm --filter @bazarx/backend dev     # port 3001
pnpm --filter @bazarx/frontend dev    # port 3002

# Build kontrolü
pnpm --filter @bazarx/backend build
pnpm --filter @bazarx/frontend build
pnpm --filter @bazarx/frontend typecheck

# E2E testler
cd apps/frontend && pnpm test:e2e
cd apps/frontend && pnpm test:e2e:checkout
cd apps/frontend && pnpm test:e2e:auction

# Prod deploy
./scripts/deploy.sh first    # ilk kurulum
./scripts/deploy.sh update   # güncelleme
./scripts/deploy.sh status   # durum
```
