# BazarX Master Plan
**Versiyon:** 4.3 | **Tarih:** 2026-05-24 | **Durum:** Aktif Geliştirme

---

## 1. System Overview

**BazarX** — Turkiye'nin cok modlu ticaret platformu. dort ana moduldan olusur:

| Modul | Aciklama |
|-------|----------|
| **TicariTakas** (B2B Barter) | Isletmeler arasinda takas/alısveriş platformu, güven skoru, pool matching |
| **BazarX** (Marketplace) | B2C e-ticaret pazarı, urun vitrini, sepet, siparis |
| **BazarX-GO** | O2O yiyecek/icecek deneyimi, menü abonelik sistemi, QR satin alma |
| **BarterBorsa** | Blinde pool takas sistemi |

**Hedef Kullanicilar:** B2B sirketler (TicariTakas), B2C tuketiciler, restoranlar (GO)

---

## 2. Module Architecture (Backend)

### 2.1 Core Modules (`apps/backend/src/modules/`)

| Modul | Sorumluluk |
|-------|-----------|
| `barter` | B2B takas sistemi: SwapSession, TradeOffer, TrustScore, Collateral |
| `barterborsa` | Blind pool matching, VendorB2BData |
| `catalog` | Listing, Product, Brand, Category, Campaign, Buybox |
| `commerce` | Order, Cart, Checkout, Dispute, Return, Invoice |
| `delivery` | Kargo takibi, Dispatch, Courier entegrasyonları |
| `financial-gateway` | Wallet, Escrow, Withdrawal (gRPC client) |
| `identity` | User, Profile, Address, Google OAuth |
| `vendor` | Vendor, Company, Ecosystem, Brand, Banner, Ad, EarlyPayment |
| `menu` | BazarX-GO: MenuPurchase, Subscription, Referral, QR |
| `loyalty` | XP, Mission, Milestone, Tier progression |
| `auction` | Auction, Lottery sistemleri |
| `garage-sale` | Flash sale, SmartCap |
| `advertising` | AD campaigns, Slots |
| `analytics` | Analytics tracking |
| `audit` | Audit loglari |
| `communication` | Notifications, Chat, FCM, Mail |
| `content` | Banner, Policy, Help, Announcement |
| `inventory` | Stock, Transfer |
| `marketing` | Gift voucher |

### 2.2 Key Controllers (107 toplam)

```
BarterAdminController, SurplusController, OffersController, WantedItemsController
BarterController, TrustScoreController, SwapSessionController, TradeReviewController
AuctionController, AuctionAdminController, LotteryController, LotteryAdminController
MenuController, MenuRedeemController, MenuAdminController
CheckoutController, OrderController, CartController
VendorController, VendorAdminController, EcosystemController
WalletController, WalletAdminController
```

---

## 3. Frontend Architecture

### 3.1 Key Pages (`apps/frontend/pages/`)

| Sayfa | Aciklama |
|-------|----------|
| `/index.vue` | Ana sayfa — Hero, QuadCards, GroupBuy, FlashSales, BarterPool |
| `/ticaritakas/*` | B2B TicariTakas arayüzü |
| `/bazarx-go/*` | GO restoran/menü sayfaları |
| `/cart.vue`, `/checkout.vue` | Sepet ve odeme akisi |
| `/vendor/*` | Satıcı paneli (dashboard, urunler, ayarlar) |
| `/admin/*` | Yönetici paneli (45 alt sayfa) |
| `/auctions/*`, `/lotteries/*` | Müzayede ve piyango |
| `/membership` | GO abonelik yönetimi |
| `/wallet` | Cüzdan işlemleri |

### 3.2 Stores & Composables

**Stores (Pinia):**
- `auth.ts`, `cart.ts`, `wishlist.ts`, `auction.ts`, `lottery.ts`, `notification.ts`

**Key Composables:**
- `useApi.ts` — Merkezi API cagrisi (109 baglantili)
- `useAdminDashboard`, `useAdminOrders`, `useAdminVendors`
- `useCheckout`, `useCartPage`, `useCheckoutPayment`
- `useBarterWallet`, `useSurplusForm`, `useTradeOffers`

---

## 4. Database Design

### 4.1 MongoDB Collections (Mongoose)

| Koleksiyon | Aciklamalar |
|-----------|-------------|
| `users`, `user_profiles` | Kullanici ve profil bilgileri |
| `listings` | Urun ilanları (vendorType: COMMERCE/RESTAURANT) |
| `catalog_products` | Katalog urunleri |
| `orders` | Siparisler (vendorId bazli gruplama) |
| `barter_swap_sessions` | Takas oturumları |
| `trade_offers` | Ticaret teklifleri |
| `surplus_items` | Artı malzemeler (WantedItem ile eslestirme) |
| `wallet_transactions` | Finansal hareketler |
| `menu_purchases`, `menu_redemptions` | GO menü islemleri |
| `user_subscriptions` | Abonelik tier bilgisi |
| `ecosystem_memberships` | Ecosistem uyelikleri |
| `auctions`, `lotteries` | Müzayede/piyango |
| `garage_sales` | Flash sale kampanyaları |
| `audit_logs` | Sistem denetim logları |

---

## 5. Business Rules by Domain

### 5.1 B2B / TicariTakas (Barter Module)

**SwapSession State Machine:**
```
PENDING_COLLATERAL → ACTIVE → SHIPPING → PARTIALLY_COMPLETED → COMPLETED
                                                    ↓
                                              CANCELLED/DISPUTED/TIMEOUT
```

**TradeOffer Status:**
```
PENDING → ACCEPTED | REJECTED | COUNTER_OFFERED | EXPIRED | CANCELLED | COMPLETED | LEGAL_PENDING
```

**Trust Score Kuralları:**
- Score >= 80 → EXCELLENT
- Score >= 60 → GOOD
- Score >= 40 → FAIR
- Score < 40 → POOR (freeze candidate)
- 3 ihlalde dondurma (FREEZE_VIOLATION_THRESHOLD)
- 90 gun inaktivite = 10 puan/ay ceza
- 0 XP = 5 puan/ay ceza

**Collateral:** %20 of estimated trade value (CollateralCalculatorService)

**Matching Engine:** 
- Batch matching: Her gece 02:00
- Min match score: 50 (FULL_ONLY: 80)
- BATCH_SIZE: 100

### 5.2 BazarX-GO (Menu Module)

**Subscription Tiers (Aylik aidat):**
| Tier | Aylik Ucret | Breakeven Ciro (5x) |
|------|-------------|---------------------|
| BRONZE_P1 | 199₺ | 4.975₺ |
| BRONZE_P2 | 399₺ | 7.980₺ |
| SILVER_P1 | 699₺ | 11.650₺ |
| SILVER_P2 | 999₺ | 14.271₺ |
| GOLD_P1 | 1.499₺ | 18.738₺ |
| GOLD_P2 | 1.999₺ | 22.211₺ |
| DIAMOND_P1 | 2.999₺ | 29.990₺ |
| DIAMOND_P2 | 4.999₺ | 41.658₺ |

**Menu Category Access:**
| Kategori | Icerik | Min Tier |
|----------|--------|----------|
| 1 | VIP & Fine Dining | DIAMOND |
| 2 | Mid-Point & New Casual | GOLD |
| 3 | Casual Dining & Yerel | SILVER_P2 |
| 4 | Tatlı & Pastane | SILVER_P1 |
| 5 | Kahve & Icecek | BRONZE_P2 |
| 6 | Dondurma & Ekler | BRONZE_P1 |

**Referral Bonus Algorithm (§7):**
- 3. referansın uye olmasıyla bonus devreye girer
- Bonus tier = matched tier'ın bir altı
- XP kazanimi: referrer'e 20, referee'ye 10
- Bonus gecerlilik: 45 gun (REFERRAL_BONUS_TTL_DAYS)

**15-Day Activation:** GO uyeligi 15 gun icinde aktive edilmeli

### 5.3 Commerce (Order Flow)

**Order Status States:**
```
PENDING → PAID → CONFIRMED → PROCESSING → PREPARING/IN_TRANSIT → READY/SHIPPED → AWAITING_PICKUP/OUT_FOR_DELIVERY → DELIVERED → COMPLETED
                                                          ↓
                                                    CANCELLED/REFUNDED/PARTIALLY_REFUNDED/DISPUTED
```

**Checkout Guards:**
- Idempotency: clientMutationId ile tekrar kontrolü
- Price integrity: Frontend fiyatı güvenilmez, DB'den recalculate
- Stock lock: Odeme oncesi rezervasyon
- Atomic transactions: Order creation + stock decrement

### 5.4 Vendor / Ecosystem

**B2B Vendor Tiers (Yillik aidat + komisyon):**
| Tier | Yillik Ucret | Komisyon |
|------|--------------|----------|
| CORE | 12.000₺ | %12 |
| PRIME | 48.000₺ | %10 |
| ELITE | 120.000₺ | %8 |
| APEX | 300.000₺ | %6 |

**Ecosystem Membership Limits:**
| Tier | Uyelik Limiti |
|------|--------------|
| CORE | 2 |
| PRIME | 5 |
| ELITE | 10 |
| APEX | 0 (kurucu) |

**Factory-Dealer:** Ecosystem uyeligi ile factory-dealer iliskisi

### 5.5 Auction & Lottery

**Auction Status:** SCHEDULED → ACTIVE → ENDED → COMPLETED | CANCELLED

**Lottery Status:** ACTIVE → ENDED → DRAWN | CANCELLED

---

## 6. Scheduler/Cron Jobs

| Scheduler | Zamanlama | Gorev |
|-----------|-----------|-------|
| **BarterMatchScheduler** | `@Cron('0 2 * * *')` 02:00 | Günlük surplus-wanted batch matching |
| **SwapSchedulerService** | `@Cron('5 2 * * *')` 02:05 | SwapSession timeout kontrolü |
| **SwapSchedulerService** | `@Cron('0 9 * * 1-5')` weekdays 09:00 | Stale collateral auto-release (3 gun SLA) |
| **DisputeResolutionScheduler** | Gunluk | Uyuşmazlık cozumu |
| **AuctionCloseScheduler** | Her dakika | Süresi dolan müzayedeleri kapat |
| **LotteryDrawScheduler** | Her dakika | Çekilis sonucları |
| **CargoPollingScheduler** | Periyodik | Kargo durumu polling |
| **GarageSaleCloserService** | Gunluk | Flash sale kapatma |
| **ReturnSchedulerService** | Gunluk | Iade hatirlatmalari |
| **GiftVoucherScheduler** | Gunluk | Hediye cekleri |
| **MenuRightsCleanupService** | Gunluk | Süresi dolan menü hakları temizleme |

---

## 7. API Endpoints Summary

### 7.1 Barter/TicariTakas
- `POST /api/v1/barter/surplus` — Arti ilani olustur
- `POST /api/v1/barter/offers` — Teklif gonder
- `POST /api/v1/barter/offers/:id/accept` — Teklifi kabul et
- `POST /api/v1/barter/swap-sessions/:id/shipping` — Kargo bilgisi gonder
- `POST /api/v1/barter/swap-sessions/:id/confirm-receipt` — Teslim onayla
- `GET /api/v1/barter/trust-score/:companyId` — Güven skoru sorgula

### 7.2 Commerce
- `GET /api/v1/cart` — Sepeti getir
- `POST /api/v1/checkout` — Siparis olustur
- `GET /api/v1/orders` — Siparisler
- `POST /api/v1/orders/:id/cancel` — Iptal et

### 7.3 Menu/GO
- `POST /api/v1/menu/purchase` — Menü satin al
- `POST /api/v1/menu/redeem` — Menü kullan
- `GET /api/v1/menu/my-purchases` — satin alma gecmisi
- `GET /api/v1/menu/referral-status` — Referans durumu

### 7.4 Vendor
- `POST /api/v1/vendors/register` — Satıcı kaydı
- `GET /api/v1/vendors/dashboard` — Satıcı paneli
- `POST /api/v1/ecosystem/create` — Ecosistem olustur
- `POST /api/v1/ecosystem/members/add` — Uye ekle

### 7.5 Wallet/Financial
- `GET /api/v1/wallet/balance` — Bakiye sorgula
- `POST /api/v1/wallet/topup` — Yukleme yap
- `POST /api/v1/wallet/withdraw` — Cekme talep et

---

## 8. Key Business Constants

```typescript
// Barter Collateral
const DEFAULT_COLLATERAL_PERCENTAGE = 0.20; // %20

// Trust Score
const FREEZE_VIOLATION_THRESHOLD = 3;
const INACTIVITY_THRESHOLD_DAYS = 90;
const INACTIVITY_PENALTY_PER_MONTH = 10;
const LOW_XP_PENALTY_PER_MONTH = 5;

// Swap Session
const SWAP_TIMEOUT_DAYS = 30;
const AUTO_RELEASE_SLA_DAYS = 3;

// Referral
const REFERRAL_XP = { toReferrer: 20, toReferee: 10 };
const REFERRAL_BONUS_TTL_DAYS = 45;
const REFERRAL_RIGHTS_PER_MONTH = (month) => month === 1 ? 3 : 1;

// B2B Commission Rates
const COMMISSION_RATES = { CORE: 0.12, PRIME: 0.10, ELITE: 0.08, APEX: 0.06 };

// Ecosystem Membership Limits
const ECOSYSTEM_LIMITS = { CORE: 2, PRIME: 5, ELITE: 10, APEX: 0 };
```

---

## 9. Infrastructure

### 9.1 Services & Ports
| Servis | Port | Teknoloji |
|--------|------|-----------|
| Backend (NestJS) | 3001 | Node.js, Fastify |
| Frontend (Nuxt 3) | 3002 | Vue 3, SSR |
| Financial Service | 3004 | gRPC |
| Delivery Service | 3005 | gRPC |
| MongoDB | 27017 | Mongoose |
| Redis | 6380 | Cache/Session |
| MinIO | 9000/9001 | Media storage |
| RabbitMQ | 5672 | Event Bus |

### 9.2 Architecture Patterns
- **DDD:** Domain-Driven Design (Entity, AggregateRoot, Repository)
- **CQRS:** NestJS CQRS module for commands/queries
- **Outbox Pattern:** Event güvenilirligi
- **Circuit Breaker:** Financial/Delivery gRPC clients

---

## 10. Open Items / Known Issues (TODO/FIXME)

### Critical
1. `checkout.service.ts:64` — Idempotency key kontrolü tamamlanmasi gerekiyor
2. `buybox-calculator.service.ts` — Gercek rating XP'den cekilmeli
3. `vendor-score.service.ts:currentXp` — UserLevel entegrasyonu eksik

### Medium Priority
1. `MinIO'dan XML indirme URL'i` — E-fatura entegrasyonu (einvoice.controller.ts)
2. `CargoTrackingService` — Webhook payload isleme ve shipment guncelleme
3. `FCM gercek bildirim mekanizmasi` — SMS/Push entegrasyonu
4. `CourierUser tablosu` — Kurye listesi entegrasyonu

### Tech Debt
1. `AuditMongooseModule strict typing` — codegen ile type safety
2. `Prisma → Mongoose migration (ADR-005)` — Faz 2b devam
3. `shared-core CI/CD build` — Build adimi duzeltmesi gerekli
4. `BarterBorsa batch matching engine` — Production ready degil

### Missing Features
1. B2C subscription odeme (Iyzico entegrasyonu)
2. Excel batch limit enforcement
3. GO bildirim kampanya kuyrugu (BullMQ)
4. `allowOnlineResale=false` bulk unpublish kontrolü

---

## 11. Recent Updates (2026-05-21)

- Vendor tipi ayrimi (COMMERCE/RESTAURANT) — Listing filtering
- VendorProfile schema genisletme (banka, vitrin alanlari)
- SwapSession timeout cron 3 hata düzeltmesi
- TrustScore cron 4 hata düzeltmesi
- BazarX-GO Sprint 1-5 tamamlandi (FCM, geofencing, referans)
- GO 15 gun aktivasyon ve erken iptal cezasi

---

*Bu dokuman BazarX kod tabaninin guncel anlık görüntüsünü yansıtir. Surekli güncellenmelidir.*
