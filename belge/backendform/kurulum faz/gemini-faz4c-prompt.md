# Gemini Prompt — FAZ 4C: Commerce + FinancialGateway Modülleri

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior NestJS backend developer'sın. BarterBorsa adlı bir ticari takas platformunun backend'ini yazıyorsun.

MİMARİ KARARLAR (ASLA sorgulamayacaksın):

- Framework: NestJS 10+ / Fastify adapter
- Monorepo: Turborepo + pnpm workspaces
- TypeScript strict mode
- PostgreSQL 16 — Prisma ORM
- DDD: Entity, AggregateRoot, ValueObject, UseCase, Repository pattern
- CQRS: NestJS CQRS modülü ile Command/Query ayrımı
- Package prefix: @barterborsa/*
- Inter-service: gRPC (senkron) + RabbitMQ (asenkron)

DAHA ÖNCE TAMAMLANAN MODÜLLER:
- Faz 1: Shared paketler
- Faz 2: Identity & Auth (User, Auth, Session)
- Faz 3: Financial Service (ayrı servis — Wallet, Ledger, Commission, Escrow — gRPC :50051)
- Faz 4A: Vendor modülü (Company, Vendor, Profile, Settings, B2B, BankAccount, Ecosystem)
- Faz 4B: Catalog + Inventory (CatalogProduct, Category, Brand, Listing, ListingImage, Review, Favorite, Collection, Campaign, Warehouse, Stock, PurchaseOrder, Transfer, InventoryLog)

ÖNEMLİ MİMARİ BİLGİ — FinancialGateway:
Backend içinde financial-service'e erişim "FinancialGateway" modülü üzerinden olur.
Bu modül SADECE bir facade'dır — kendi iş mantığı YOKTUR.
gRPC client ile financial-service'i çağırır (senkron: bakiye, ödeme, escrow).
RabbitMQ event'leri dinler (asenkron: payment.completed, payment.failed).
Backend'deki diğer modüller (Commerce, Barter, Auction) FinancialGateway üzerinden finansal işlem yapar.

Financial-service gRPC servisleri (Faz 3'te tanımlı):
- WalletService: GetBalance, CreateWallet, TopupWallet, TransferFunds, GetAccount
- EscrowService: CreateEscrow, HoldFunds, ReleaseFunds, RefundFunds

SHARED PAKETLER:

@barterborsa/shared-core:
  - Entity<T>, AggregateRoot<T>, ValueObject<T>, DomainEvent
  - IRepository<T>, Command, Query
  - PaginationInput, PaginatedResult<T>
  - DomainException, NotFoundException, ConflictException
  - Result<T, E>, Ok(), Err()

@barterborsa/shared-persistence:
  - PrismaModule, PrismaService, BasePrismaRepository<T>, PrismaUnitOfWork
  - OutboxModule, OutboxPublisherService

@barterborsa/shared-messaging:
  - RabbitMQModule, RabbitMQService, IntegrationEvent, IEventBus
  - COMMERCE_EXCHANGE: order.created, order.completed, order.cancelled, order.shipped
  - FINANCIAL_EXCHANGE: payment.completed, payment.failed

@barterborsa/shared-security:
  - AuthGuard, RolesGuard

@barterborsa/shared-nest:
  - @CurrentUser(), @Roles(), @Public(), @Idempotent()
  - ResponseTransformInterceptor, GlobalExceptionFilter

KURALLAR:
1. Sadece istenen dosyaları yaz
2. Her dosyanın tam path'ini başına yorum olarak yaz
3. TypeScript strict mode
4. Import'larda @barterborsa/* workspace alias kullan
5. Kod yorumlarını Türkçe yaz
6. User tablosuna relation EKLEME — sadece userId string
7. Financial tablolara DOĞRUDAN ERİŞME — FinancialGateway üzerinden gRPC çağrısı yap
8. Decimal kullan, float YASAK
9. Order oluşturmada stok reservation ve escrow AYNI TRANSACTION'da olmalı
10. Sipariş akışında her durum değişikliğinde OrderStatusHistory kaydı oluştur
```

### GÖREV

```
FAZ 4C: Commerce modülü ve FinancialGateway facade modülünü yaz.

Commerce modülü sipariş, sepet, checkout, iade ve anlaşmazlık yönetimini kapsar.
FinancialGateway modülü backend'in financial-service ile iletişim facade'ıdır.

Sipariş akışı (kritik — TAM OLARAK BU SIRADA):

1. Kullanıcı sepete ürün ekler (Cart + CartItem)
2. Checkout başlatır:
   a. Sepetteki her listing için stok kontrolü (availableQuantity >= quantity)
   b. Fiyat hesaplama (listing price × quantity, kampanya/kupon uygula, kargo ücreti)
   c. Vendor bazında sipariş böl (farklı vendor'lardan ürünler → ayrı Order'lar)
3. Her Order için Prisma transaction içinde:
   a. Order + OrderItem kaydet (status: PENDING)
   b. InventoryModule → reserveStock (stok ayır)
   c. FinancialGateway → createEscrow + holdFunds (buyer bakiye bloke)
   d. OrderStatusHistory kaydet (PENDING)
   e. Cart'ı temizle (veya checkout edilen item'ları sil)
   f. Outbox'a order.created event'i
4. Financial-service ödemeyi onaylar → payment.completed event → Order status: PAID
5. Vendor siparişi onaylar → Order status: CONFIRMED
6. Vendor kargoyu gönderir → Order status: SHIPPED (trackingNumber eklenir)
7. Kargo teslim edilir → shipment.delivered event → Order status: DELIVERED
8. Dispute window süresi dolar → escrow release → Order status: COMPLETED
9. İptal/İade akışı:
   - PENDING/PAID durumunda iptal → stok serbest bırak + escrow refund
   - DELIVERED durumunda iade → OrderReturn oluştur → admin onayı → kısmi/tam refund

Modül yapıları:

apps/backend/src/modules/financial-gateway/
├── financial-gateway.module.ts
├── grpc/
│   ├── financial-grpc.client.ts
│   ├── wallet-grpc.service.ts
│   └── escrow-grpc.service.ts
├── event-handlers/
│   ├── payment-completed.handler.ts
│   └── payment-failed.handler.ts
└── financial-gateway.service.ts

apps/backend/src/modules/commerce/
├── application/
│   ├── commands/
│   │   ├── add-to-cart.command.ts
│   │   ├── add-to-cart.handler.ts
│   │   ├── update-cart-item.command.ts
│   │   ├── update-cart-item.handler.ts
│   │   ├── remove-from-cart.command.ts
│   │   ├── remove-from-cart.handler.ts
│   │   ├── clear-cart.command.ts
│   │   ├── clear-cart.handler.ts
│   │   ├── checkout.command.ts
│   │   ├── checkout.handler.ts
│   │   ├── confirm-order.command.ts
│   │   ├── confirm-order.handler.ts
│   │   ├── ship-order.command.ts
│   │   ├── ship-order.handler.ts
│   │   ├── deliver-order.command.ts
│   │   ├── deliver-order.handler.ts
│   │   ├── complete-order.command.ts
│   │   ├── complete-order.handler.ts
│   │   ├── cancel-order.command.ts
│   │   ├── cancel-order.handler.ts
│   │   ├── request-return.command.ts
│   │   ├── request-return.handler.ts
│   │   ├── approve-return.command.ts
│   │   ├── approve-return.handler.ts
│   │   ├── reject-return.command.ts
│   │   ├── reject-return.handler.ts
│   │   ├── open-dispute.command.ts
│   │   ├── open-dispute.handler.ts
│   │   ├── resolve-dispute.command.ts
│   │   ├── resolve-dispute.handler.ts
│   │   ├── apply-coupon.command.ts
│   │   └── apply-coupon.handler.ts
│   ├── queries/
│   │   ├── get-cart.query.ts
│   │   ├── get-cart.handler.ts
│   │   ├── get-order.query.ts
│   │   ├── get-order.handler.ts
│   │   ├── list-user-orders.query.ts
│   │   ├── list-user-orders.handler.ts
│   │   ├── list-vendor-orders.query.ts
│   │   ├── list-vendor-orders.handler.ts
│   │   ├── get-order-status-history.query.ts
│   │   ├── get-order-status-history.handler.ts
│   │   ├── get-return.query.ts
│   │   ├── get-return.handler.ts
│   │   ├── list-returns.query.ts
│   │   ├── list-returns.handler.ts
│   │   ├── get-dispute.query.ts
│   │   ├── get-dispute.handler.ts
│   │   ├── list-disputes.query.ts
│   │   └── list-disputes.handler.ts
│   ├── event-handlers/
│   │   ├── payment-completed.handler.ts
│   │   ├── payment-failed.handler.ts
│   │   └── shipment-delivered.handler.ts
│   ├── services/
│   │   ├── checkout.service.ts
│   │   ├── order-number.service.ts
│   │   └── pricing.service.ts
│   └── dtos/
│       ├── add-to-cart.dto.ts
│       ├── update-cart-item.dto.ts
│       ├── checkout.dto.ts
│       ├── ship-order.dto.ts
│       ├── request-return.dto.ts
│       ├── open-dispute.dto.ts
│       ├── resolve-dispute.dto.ts
│       ├── apply-coupon.dto.ts
│       ├── cart-response.dto.ts
│       ├── cart-item-response.dto.ts
│       ├── order-response.dto.ts
│       ├── order-detail-response.dto.ts
│       ├── order-item-response.dto.ts
│       ├── return-response.dto.ts
│       └── dispute-response.dto.ts
├── domain/
│   ├── entities/
│   │   ├── order.entity.ts
│   │   ├── order-item.entity.ts
│   │   ├── cart.entity.ts
│   │   ├── cart-item.entity.ts
│   │   ├── order-status-history.entity.ts
│   │   ├── order-return.entity.ts
│   │   └── dispute.entity.ts
│   ├── value-objects/
│   │   ├── order-number.vo.ts
│   │   ├── shipping-address.vo.ts
│   │   └── order-total.vo.ts
│   ├── events/
│   │   ├── order-created.event.ts
│   │   ├── order-paid.event.ts
│   │   ├── order-confirmed.event.ts
│   │   ├── order-shipped.event.ts
│   │   ├── order-delivered.event.ts
│   │   ├── order-completed.event.ts
│   │   ├── order-cancelled.event.ts
│   │   ├── return-requested.event.ts
│   │   └── dispute-opened.event.ts
│   ├── repositories/
│   │   ├── order.repository.interface.ts
│   │   ├── order-item.repository.interface.ts
│   │   ├── cart.repository.interface.ts
│   │   ├── order-status-history.repository.interface.ts
│   │   ├── order-return.repository.interface.ts
│   │   └── dispute.repository.interface.ts
│   ├── enums/
│   │   ├── order-status.enum.ts
│   │   └── dispute-status.enum.ts
│   └── services/
│       └── order-state-machine.service.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-order.repository.ts
│   │   ├── prisma-order-item.repository.ts
│   │   ├── prisma-cart.repository.ts
│   │   ├── prisma-order-status-history.repository.ts
│   │   ├── prisma-order-return.repository.ts
│   │   ├── prisma-dispute.repository.ts
│   │   └── mappers/
│   │       ├── order.mapper.ts
│   │       ├── order-item.mapper.ts
│   │       ├── cart.mapper.ts
│   │       ├── order-status-history.mapper.ts
│   │       ├── order-return.mapper.ts
│   │       └── dispute.mapper.ts
│   └── event-publishers/
│       └── commerce-event.publisher.ts
├── presentation/
│   ├── cart.controller.ts
│   ├── checkout.controller.ts
│   ├── order.controller.ts
│   ├── order-vendor.controller.ts
│   ├── return.controller.ts
│   ├── dispute.controller.ts
│   └── commerce-admin.controller.ts
└── commerce.module.ts
```

### MEVCUT PRİSMA ŞEMASI — REFERANS

Backend Prisma şemasına aşağıdaki tabloları ekle. Mevcut tablolara (Identity, Vendor, Catalog, Inventory) DOKUNMA.

```prisma
// === COMMERCE ENUMS ===

enum OrderStatus {
  PENDING
  PAID
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  COMPLETED
  CANCELLED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED
  CANCELLED
}

// === COMMERCE TABLES ===

model Order {
  id                String               @id @default(cuid())
  userId            String               @map("user_id")
  vendorId          String               @map("vendor_id")
  status            OrderStatus          @default(PENDING)
  totalAmount       Decimal              @map("total_amount") @db.Decimal(18, 2)
  shippingAddress   Json                 @map("shipping_address")
  billingAddress    Json                 @map("billing_address")
  paymentMethod     PaymentMethod        @map("payment_method")
  shippingMethod    String?              @map("shipping_method")
  trackingNumber    String?              @map("tracking_number")
  notes             String?
  createdAt         DateTime             @default(now()) @map("created_at")
  updatedAt         DateTime             @updatedAt @map("updated_at")
  paymentStatus     PaymentStatus        @default(PENDING) @map("payment_status")
  vendorStatus      String               @default("PENDING") @map("vendor_status")
  buyerStatus       String               @default("PENDING") @map("buyer_status")
  currency          String               @default("TRY")
  discountAmount    Decimal              @default(0) @map("discount_amount") @db.Decimal(18, 2)
  orderNumber       String?              @unique @map("order_number")
  payoutStatus      String?              @map("payout_status")
  paidWithXP        Decimal              @default(0) @map("paid_with_xp") @db.Decimal(18, 2)
  paidWithCash      Decimal              @default(0) @map("paid_with_cash") @db.Decimal(18, 2)
  paidAt            DateTime?            @map("paid_at")
  paymentIntentId   String?              @map("payment_intent_id")
  metadata          Json?
  couponCode        String?              @map("coupon_code")
  shippingCarrier   String?              @map("shipping_carrier")
  estimatedDelivery DateTime?            @map("estimated_delivery")
  escrowStatus      String?              @default("NONE") @map("escrow_status")
  escrowReleaseAt   DateTime?            @map("escrow_release_at")
  payoutEligibleAt  DateTime?            @map("payout_eligible_at")
  shippingCost      Decimal              @default(0) @map("shipping_cost") @db.Decimal(18, 2)
  // Relations
  dispute           Dispute?
  orderItems        OrderItem[]
  returns           OrderReturn[]
  statusHistory     OrderStatusHistory[]
  vendor            Vendor               @relation(fields: [vendorId], references: [id])
  reviews           Review[]

  @@index([userId])
  @@index([vendorId])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id            String   @id @default(cuid())
  orderId       String   @map("order_id")
  listingId     String   @map("listing_id")
  quantity      Int
  price         Decimal  @db.Decimal(18, 2)
  totalAmount   Decimal  @map("total_amount") @db.Decimal(18, 2)
  productName   String   @map("product_name")
  productImages String[] @map("product_images")
  variantInfo   Json?    @map("variant_info")
  listing       Listing  @relation(fields: [listingId], references: [id])
  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([listingId])
  @@map("order_items")
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique @map("user_id")
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")
  items     CartItem[]

  @@map("carts")
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String   @map("cart_id")
  listingId String   @map("listing_id")
  quantity  Int      @default(1)
  addedAt   DateTime @default(now()) @map("added_at")
  variantId String?  @map("variant_id")
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@index([cartId])
  @@index([listingId])
  @@map("cart_items")
}

model OrderStatusHistory {
  id        String      @id @default(cuid())
  orderId   String      @map("order_id")
  userId    String?     @map("user_id")
  status    OrderStatus
  note      String?
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("order_status_history")
}

model OrderReturn {
  id           String   @id @default(cuid())
  reason       String
  status       String   @default("PENDING")
  createdAt    DateTime @default(now()) @map("created_at")
  orderId      String   @map("order_id")
  receiptUrl   String?  @map("receipt_url")
  refundAmount Decimal  @map("refund_amount") @db.Decimal(18, 2)
  updatedAt    DateTime @updatedAt @map("updated_at")
  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("order_returns")
}

model Dispute {
  id             String        @id @default(cuid())
  orderId        String        @unique @map("order_id")
  userId         String        @map("user_id")
  vendorId       String        @map("vendor_id")
  reason         String
  description    String?
  status         DisputeStatus @default(OPEN)
  evidenceUrls   String[]      @map("evidence_urls")
  adminNote      String?       @map("admin_note")
  resolvedAt     DateTime?     @map("resolved_at")
  resolutionType String?       @map("resolution_type")
  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")
  order          Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  vendor         Vendor        @relation(fields: [vendorId], references: [id])

  @@index([status])
  @@map("disputes")
}
```

NOT: Vendor modeline (Faz 4A'da tanımlı) şu relation'ları EKLE:
```prisma
orders            Order[]
disputes          Dispute[]
```

PaymentMethod ve PaymentStatus enum'ları financial-service Prisma'da tanımlı.
Backend şemasında da aynı enum'ları TEKRAR tanımla (iki ayrı DB, enum paylaşılamaz):
```prisma
enum PaymentMethod {
  IYZICO
  BANK_TRANSFER
  WALLET
  BARTER
  GIFT_CARD
  MIXED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
  PARTIALLY_REFUNDED
}
```

### DOSYA LİSTESİ — HER BİRİNİN TAM İÇERİĞİNİ YAZ

```
=== PRİSMA GÜNCELLEME ===

DOSYA #1: apps/backend/prisma/schema.prisma
- Mevcut tablolara DOKUNMA (Identity, Vendor, Catalog, Inventory)
- Yukarıdaki commerce tablolarını, enum'ları ekle
- Vendor modeline orders, disputes relation'larını ekle
- PaymentMethod, PaymentStatus enum'ları ekle

=== FINANCIAL GATEWAY MODULE ===

DOSYA #2: apps/backend/src/modules/financial-gateway/grpc/financial-grpc.client.ts
- gRPC client konfigürasyonu
- financial-service'e bağlantı (FINANCIAL_GRPC_URL env)
- @grpc/grpc-js ve @grpc/proto-loader kullan
- Proto dosyası: Faz 3'te tanımlanan financial.proto path'i

DOSYA #3: apps/backend/src/modules/financial-gateway/grpc/wallet-grpc.service.ts
- WalletGrpcService
- Inject: gRPC client
- Metodlar (hepsi financial-service'e gRPC çağrısı):
  - getBalance(userId): bakiye sorgula → { balanceTL, barterBalance, availableBalance, blockedBalance }
  - createWallet(userId): cüzdan oluştur
  - topupWallet(userId, amount, idempotencyKey, paymentMethod): para yükle
  - transferFunds(fromUserId, toUserId, amount, idempotencyKey, description): transfer
  - getAccount(userId, accountType): hesap bilgisi
- Her çağrıda timeout (5 saniye) ve retry logic (max 3)
- gRPC hata kodlarını DomainException'a dönüştür

DOSYA #4: apps/backend/src/modules/financial-gateway/grpc/escrow-grpc.service.ts
- EscrowGrpcService
- Inject: gRPC client
- Metodlar:
  - createEscrow(orderId, buyerId, sellerId, amount, idempotencyKey): emanet oluştur
  - holdFunds(accountId, amount, reason, referenceId, referenceType, idempotencyKey): bakiye bloke et
  - releaseFunds(holdId, idempotencyKey): bloke kaldır + seller'a aktar
  - refundFunds(escrowId, amount, idempotencyKey): buyer'a iade
- Timeout ve retry logic

DOSYA #5: apps/backend/src/modules/financial-gateway/financial-gateway.service.ts
- FinancialGatewayService — tek facade sınıfı
- Inject: WalletGrpcService, EscrowGrpcService
- Metodlar (wrapper — iş mantığı YOK, sadece delegate):
  - getBalance(userId)
  - createWallet(userId)
  - topupWallet(userId, amount, idempotencyKey, paymentMethod)
  - transferFunds(fromUserId, toUserId, amount, idempotencyKey, description)
  - createEscrow(orderId, buyerId, sellerId, amount, idempotencyKey)
  - holdFunds(accountId, amount, reason, referenceId, referenceType, idempotencyKey)
  - releaseFunds(holdId, idempotencyKey)
  - refundFunds(escrowId, amount, idempotencyKey)
- NOT: Bu sınıf SADECE gRPC çağrılarını proxy eder, kendi iş mantığı yoktur

DOSYA #6: apps/backend/src/modules/financial-gateway/event-handlers/payment-completed.handler.ts
- RabbitMQ'dan FINANCIAL_EXCHANGE, routing key: payment.completed dinle
- Event payload: { orderId, amount, paymentMethod, transactionId }
- CommandBus üzerinden Commerce modülündeki komutu dispatch et

DOSYA #7: apps/backend/src/modules/financial-gateway/event-handlers/payment-failed.handler.ts
- RabbitMQ'dan payment.failed dinle
- Event payload: { orderId, reason, failedAt }
- Order iptal akışını tetikle

DOSYA #8: apps/backend/src/modules/financial-gateway/financial-gateway.module.ts
- NestJS Module
- imports: ClientsModule.registerAsync (gRPC), SharedMessagingModule
- providers: WalletGrpcService, EscrowGrpcService, FinancialGatewayService, event handlers
- exports: FinancialGatewayService (diğer modüller kullanabilsin)

=== COMMERCE MODULE — DOMAIN ===

DOSYA #9: apps/backend/src/modules/commerce/domain/enums/order-status.enum.ts
- OrderStatus: PENDING, PAID, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, COMPLETED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED

DOSYA #10: apps/backend/src/modules/commerce/domain/enums/dispute-status.enum.ts
- DisputeStatus: OPEN, UNDER_REVIEW, RESOLVED, CANCELLED

DOSYA #11: apps/backend/src/modules/commerce/domain/value-objects/order-number.vo.ts
- OrderNumber extends ValueObject
- Format: BB-YYYYMMDD-XXXXX (BB prefix + tarih + 5 haneli random)
- static generate(): yeni sipariş numarası üret

DOSYA #12: apps/backend/src/modules/commerce/domain/value-objects/shipping-address.vo.ts
- ShippingAddress extends ValueObject
- Props: firstName, lastName, phone, addressLine1, addressLine2, city, district, neighborhood, postalCode
- getFullAddress(): tam adres string'i
- toJson(): JSON olarak kaydet (Order tablosunda Json alanı)
- static fromJson(json): JSON'dan oluştur

DOSYA #13: apps/backend/src/modules/commerce/domain/value-objects/order-total.vo.ts
- OrderTotal extends ValueObject
- Props: subtotal (Decimal), discountAmount (Decimal), shippingCost (Decimal), total (Decimal), paidWithCash (Decimal), paidWithXP (Decimal)
- static calculate(items, discount, shipping): toplam hesapla
- Tüm hesaplamalar Decimal ile

DOSYA #14: apps/backend/src/modules/commerce/domain/entities/order.entity.ts
- Order extends AggregateRoot
- Props: userId, vendorId, status (OrderStatus), totalAmount (Decimal), shippingAddress (ShippingAddress VO),
  billingAddress (ShippingAddress VO), paymentMethod, shippingMethod, trackingNumber, notes, paymentStatus,
  vendorStatus, buyerStatus, currency, discountAmount, orderNumber (OrderNumber VO), payoutStatus,
  paidWithXP, paidWithCash, paidAt, paymentIntentId, metadata, couponCode, shippingCarrier,
  estimatedDelivery, escrowStatus, escrowReleaseAt, payoutEligibleAt, shippingCost, items (OrderItem[])
- static create(userId, vendorId, items, shippingAddress, billingAddress, paymentMethod, totals):
  status PENDING + OrderCreatedEvent
- STATE MACHINE — her geçiş validate edilmeli:
  - pay(): PENDING → PAID + OrderPaidEvent (paidAt set)
  - confirm(): PAID → CONFIRMED + OrderConfirmedEvent
  - process(): CONFIRMED → PROCESSING
  - ship(trackingNumber, carrier): PROCESSING/CONFIRMED → SHIPPED + OrderShippedEvent
  - deliver(): SHIPPED → DELIVERED + OrderDeliveredEvent
  - complete(): DELIVERED → COMPLETED + OrderCompletedEvent (escrowReleaseAt geçmişse)
  - cancel(reason): PENDING/PAID → CANCELLED + OrderCancelledEvent
  - refund(): → REFUNDED
  - partialRefund(amount): → PARTIALLY_REFUNDED
- canCancel(): sadece PENDING veya PAID durumunda
- canReturn(): sadece DELIVERED durumunda
- canDispute(): sadece DELIVERED veya SHIPPED durumunda
- addStatusHistory(status, note, userId): OrderStatusHistory kaydı oluştur

DOSYA #15: apps/backend/src/modules/commerce/domain/entities/order-item.entity.ts
- OrderItem extends Entity
- Props: orderId, listingId, quantity (int), price (Decimal), totalAmount (Decimal),
  productName, productImages (string[]), variantInfo (Json)
- static create(listing, quantity): listing bilgilerini snapshot olarak kaydet
  (ürün ismi, fiyatı, görselleri — sonradan değişse bile sipariş kaydı değişmez)

DOSYA #16: apps/backend/src/modules/commerce/domain/entities/cart.entity.ts
- Cart extends AggregateRoot
- Props: userId, items (CartItem[])
- static create(userId): boş sepet
- addItem(listingId, quantity, variantId): item ekle (aynı listing varsa quantity artır)
- updateItemQuantity(itemId, quantity): miktar güncelle (0 ise sil)
- removeItem(itemId): item sil
- clear(): tüm item'ları sil
- getTotal(): toplam tutar (listing fiyat × quantity)
- isEmpty(): items.length === 0
- getItemCount(): toplam ürün sayısı

DOSYA #17: apps/backend/src/modules/commerce/domain/entities/cart-item.entity.ts
- CartItem extends Entity
- Props: cartId, listingId, quantity, addedAt, variantId
- updateQuantity(newQty): quantity güncelle, validation: qty > 0

DOSYA #18: apps/backend/src/modules/commerce/domain/entities/order-status-history.entity.ts
- OrderStatusHistory extends Entity (append-only)
- Props: orderId, userId, status (OrderStatus), note, createdAt

DOSYA #19: apps/backend/src/modules/commerce/domain/entities/order-return.entity.ts
- OrderReturn extends Entity
- Props: orderId, reason, status (PENDING/APPROVED/REJECTED/COMPLETED), receiptUrl, refundAmount
- approve(): PENDING → APPROVED → refund tetikle
- reject(): PENDING → REJECTED
- complete(): APPROVED → COMPLETED

DOSYA #20: apps/backend/src/modules/commerce/domain/entities/dispute.entity.ts
- Dispute extends AggregateRoot
- Props: orderId, userId, vendorId, reason, description, status (DisputeStatus),
  evidenceUrls, adminNote, resolvedAt, resolutionType
- static create(): status OPEN + DisputeOpenedEvent
- review(): OPEN → UNDER_REVIEW
- resolve(resolutionType, adminNote): → RESOLVED, resolvedAt set
  resolutionType: REFUND_BUYER, FAVOR_SELLER, PARTIAL_REFUND, CANCEL
- cancel(): → CANCELLED

DOSYA #21: apps/backend/src/modules/commerce/domain/services/order-state-machine.service.ts
- OrderStateMachine
- Geçerli geçişleri tanımla:
  PENDING → [PAID, CANCELLED]
  PAID → [CONFIRMED, CANCELLED]
  CONFIRMED → [PROCESSING, SHIPPED, CANCELLED]
  PROCESSING → [SHIPPED]
  SHIPPED → [DELIVERED]
  DELIVERED → [COMPLETED, REFUNDED, PARTIALLY_REFUNDED]
  COMPLETED → []
  CANCELLED → []
- canTransition(from, to): boolean
- validateTransition(from, to): geçersizse DomainException fırlat

DOSYA #22-30: Domain events (order-created, order-paid, order-confirmed, order-shipped, order-delivered, order-completed, order-cancelled, return-requested, dispute-opened)

DOSYA #31-36: Repository interfaces (order, order-item, cart, order-status-history, order-return, dispute)
- IOrderRepository: findByUserId(paginated), findByVendorId(paginated), findByOrderNumber, findById
  filters: status, dateRange, paymentStatus
- ICartRepository: findByUserId, save, clearItems

=== COMMERCE MODULE — APPLICATION Services ===

DOSYA #37: apps/backend/src/modules/commerce/application/services/order-number.service.ts
- OrderNumberService
- generate(): BB-YYYYMMDD-XXXXX formatında unique numara üret
- Collision kontrolü: DB'de var mı kontrol et, varsa tekrar üret

DOSYA #38: apps/backend/src/modules/commerce/application/services/pricing.service.ts
- PricingService
- calculateOrderTotal(items: {listing, quantity}[], couponCode?, shippingCost?): OrderTotal
  1. Subtotal: her item için listing.price × quantity
  2. Discount: kupon varsa Campaign/Coupon tablosundan kontrol, uygula
  3. Shipping: vendor settings'den veya sabit ücret
  4. Total: subtotal - discount + shipping
- validateCoupon(code, userId, totalAmount): kupon geçerli mi, kullanılabilir mi

DOSYA #39: apps/backend/src/modules/commerce/application/services/checkout.service.ts
- CheckoutService — EN KRİTİK SERVİS
- Inject: ICartRepository, IOrderRepository, IListingRepository (Catalog'dan),
  FinancialGatewayService, InventoryModule'den reserve-stock,
  PricingService, OrderNumberService, PrismaUnitOfWork
- checkout(userId, shippingAddress, billingAddress, paymentMethod, couponCode?):
  1. Cart'ı getir, boş mu kontrol et
  2. Her CartItem için:
     a. Listing aktif mi kontrol
     b. Stok yeterli mi kontrol (availableQuantity >= quantity)
     c. Listing fiyatını al (anlık fiyat — race condition'a karşı)
  3. Vendor bazında grupla (farklı vendor → ayrı sipariş)
  4. Her vendor grubu için PrismaUnitOfWork.execute içinde:
     a. OrderNumber üret
     b. OrderTotal hesapla (PricingService)
     c. Order.create() + OrderItem.create()
     d. Her OrderItem için → reserveStock (Inventory modülü)
     e. FinancialGateway → createEscrow(orderId, buyerId=userId, sellerId=vendorId, amount)
     f. FinancialGateway → holdFunds(buyerAccountId, amount, ESCROW, orderId, 'ORDER')
     g. OrderStatusHistory kaydet (PENDING)
     h. Outbox'a order.created event
  5. Cart'ı temizle
  6. Oluşturulan Order'ları döndür
- HATA DURUMU: herhangi bir adım başarısız olursa transaction rollback
  (stok reserve iptal, escrow iptal — saga veya transaction rollback ile)

=== COMMERCE MODULE — APPLICATION DTOs ===

DOSYA #40: add-to-cart.dto.ts — listingId, quantity, variantId?
DOSYA #41: update-cart-item.dto.ts — quantity
DOSYA #42: checkout.dto.ts
- shippingAddressId (UserAddress'ten) VEYA inline shippingAddress objesi
- billingAddressId VEYA inline billingAddress objesi
- paymentMethod
- couponCode?
- notes?

DOSYA #43: ship-order.dto.ts — trackingNumber, shippingCarrier, estimatedDelivery?
DOSYA #44: request-return.dto.ts — orderId, reason, receiptUrl?
DOSYA #45: open-dispute.dto.ts — orderId, reason, description, evidenceUrls[]
DOSYA #46: resolve-dispute.dto.ts — resolutionType, adminNote, refundAmount?
DOSYA #47: apply-coupon.dto.ts — couponCode

DOSYA #48: cart-response.dto.ts — id, items[], itemCount, totalAmount
DOSYA #49: cart-item-response.dto.ts — id, listingId, listingTitle, listingImage, price, quantity, subtotal, variantInfo
DOSYA #50: order-response.dto.ts — id, orderNumber, status, totalAmount, vendorName, itemCount, createdAt, paymentStatus
DOSYA #51: order-detail-response.dto.ts — tüm order alanları + items[] + statusHistory[] + shippingAddress + vendor bilgisi
DOSYA #52: order-item-response.dto.ts — id, productName, productImages, price, quantity, totalAmount, variantInfo
DOSYA #53: return-response.dto.ts
DOSYA #54: dispute-response.dto.ts

=== COMMERCE MODULE — APPLICATION Commands ===

DOSYA #55-56: add-to-cart command + handler
- Cart yoksa oluştur
- Listing aktif mi ve stok var mı kontrol
- Aynı listing + variant zaten sepette varsa quantity artır
- maxPurchasePerMember kontrolü

DOSYA #57-58: update-cart-item command + handler
- quantity 0 ise item'ı sil
- Stok kontrolü (yeni quantity <= availableQuantity)

DOSYA #59-60: remove-from-cart command + handler
DOSYA #61-62: clear-cart command + handler

DOSYA #63-64: checkout command + handler
- CheckoutService.checkout() çağır
- Tüm iş mantığı CheckoutService'te — handler sadece delegate eder

DOSYA #65-66: confirm-order command + handler
- @Roles('VENDOR') — vendor kendi siparişini onaylar
- OrderStateMachine.validateTransition(PAID → CONFIRMED)
- order.confirm() + OrderStatusHistory kaydet

DOSYA #67-68: ship-order command + handler
- @Roles('VENDOR')
- trackingNumber zorunlu
- order.ship() + OrderStatusHistory
- order.shipped event → RabbitMQ (delivery-service kargo takibi başlatsın)

DOSYA #69-70: deliver-order command + handler
- Genellikle shipment.delivered event'i ile tetiklenir (otomatik)
- order.deliver() + OrderStatusHistory
- escrowReleaseAt = now + 3 gün (dispute window)

DOSYA #71-72: complete-order command + handler
- escrowReleaseAt geçmişse çalışır (cron job veya event ile)
- FinancialGateway → releaseFunds (escrow → seller'a aktar)
- order.complete() + OrderCompletedEvent
- OrderCompleted event → financial-service komisyon hesaplasın

DOSYA #73-74: cancel-order command + handler
- canCancel() kontrolü (sadece PENDING/PAID)
- Prisma transaction içinde:
  1. order.cancel()
  2. Her OrderItem için → releaseStock (Inventory)
  3. FinancialGateway → refundFunds (escrow → buyer'a iade)
  4. OrderStatusHistory kaydet
  5. Outbox: order.cancelled event

DOSYA #75-76: request-return command + handler
- canReturn() kontrolü (sadece DELIVERED)
- OrderReturn.create(reason, refundAmount)
- ReturnRequested event

DOSYA #77-78: approve-return command + handler
- @Roles('ADMIN')
- OrderReturn.approve()
- FinancialGateway → refundFunds (kısmi veya tam)
- Order status → REFUNDED veya PARTIALLY_REFUNDED

DOSYA #79-80: reject-return command + handler — @Roles('ADMIN')

DOSYA #81-82: open-dispute command + handler
- canDispute() kontrolü
- Dispute.create()
- Escrow status → DISPUTED (FinancialGateway üzerinden)
- DisputeOpened event

DOSYA #83-84: resolve-dispute command + handler
- @Roles('ADMIN')
- resolutionType'a göre:
  REFUND_BUYER → refundFunds (tam iade)
  FAVOR_SELLER → releaseFunds (seller'a aktar)
  PARTIAL_REFUND → refundFunds(kısmi) + releaseFunds(kalan)
  CANCEL → order iptal + tam iade

DOSYA #85-86: apply-coupon command + handler
- Kupon kodu doğrula (PricingService.validateCoupon)
- Cart'a coupon uygula (discount hesapla)

=== COMMERCE MODULE — APPLICATION Queries ===

DOSYA #87-88: get-cart query + handler — userId ile sepet getir, listing bilgileriyle birlikte
DOSYA #89-90: get-order query + handler — orderId veya orderNumber ile, items + statusHistory include
DOSYA #91-92: list-user-orders query + handler — paginated, filter: status, dateRange
DOSYA #93-94: list-vendor-orders query + handler — vendor'ın siparişleri, paginated, filter: status, dateRange
DOSYA #95-96: get-order-status-history query + handler
DOSYA #97-98: get-return / list-returns query + handler
DOSYA #99-100: get-dispute / list-disputes query + handler

=== COMMERCE MODULE — APPLICATION Event Handlers ===

DOSYA #101: payment-completed.handler.ts
- RabbitMQ'dan payment.completed dinle (FinancialGateway üzerinden gelir)
- Order bul, order.pay(), OrderStatusHistory kaydet, Outbox: order.paid

DOSYA #102: payment-failed.handler.ts
- payment.failed → order iptal akışı tetikle (cancel-order command dispatch)

DOSYA #103: shipment-delivered.handler.ts
- RabbitMQ'dan shipment.delivered dinle (delivery-service'ten)
- deliver-order command dispatch et

=== COMMERCE MODULE — Infrastructure ===

DOSYA #104-109: Mappers (order, order-item, cart, order-status-history, order-return, dispute)

DOSYA #110: prisma-order.repository.ts
- findByOrderNumber, findByUserId(paginated + filter), findByVendorId(paginated + filter)
- Include: orderItems, statusHistory, vendor.profile
- Status filter, dateRange filter

DOSYA #111: prisma-order-item.repository.ts
DOSYA #112: prisma-cart.repository.ts
- findByUserId: include items + listing (title, price, images, stock)
- clearItems(cartId): tüm CartItem'ları sil

DOSYA #113: prisma-order-status-history.repository.ts — append-only
DOSYA #114: prisma-order-return.repository.ts
DOSYA #115: prisma-dispute.repository.ts

DOSYA #116: commerce-event.publisher.ts
- COMMERCE_EXCHANGE = 'commerce.events'
- Routing keys: order.created, order.paid, order.confirmed, order.shipped,
  order.delivered, order.completed, order.cancelled, return.requested, dispute.opened

=== COMMERCE MODULE — Presentation ===

DOSYA #117: cart.controller.ts
- GET /cart — authenticated, sepeti getir (listing bilgileriyle)
- POST /cart/items — authenticated, sepete ekle
- PATCH /cart/items/:id — authenticated, miktar güncelle
- DELETE /cart/items/:id — authenticated, sepetten çıkar
- DELETE /cart — authenticated, sepeti temizle
- POST /cart/coupon — authenticated, kupon uygula

DOSYA #118: checkout.controller.ts
- POST /checkout — authenticated, sipariş oluştur
  Body: CheckoutDto
  Response: OrderResponseDto[] (vendor bazında bölünmüş siparişler)

DOSYA #119: order.controller.ts
- GET /orders — authenticated, kullanıcının siparişleri (paginated)
- GET /orders/:id — authenticated, sipariş detayı
- GET /orders/number/:orderNumber — authenticated, sipariş numarasıyla ara
- POST /orders/:id/cancel — authenticated, sipariş iptal
- GET /orders/:id/history — authenticated, durum geçmişi

DOSYA #120: order-vendor.controller.ts
- GET /vendors/me/orders — authenticated vendor, gelen siparişler (paginated)
- GET /vendors/me/orders/:id — authenticated vendor, sipariş detayı
- POST /vendors/me/orders/:id/confirm — authenticated vendor, siparişi onayla
- POST /vendors/me/orders/:id/ship — authenticated vendor, kargoya ver

DOSYA #121: return.controller.ts
- POST /orders/:id/return — authenticated, iade talebi
- GET /returns — authenticated, iade taleplerim
- POST /admin/returns/:id/approve — @Roles('ADMIN')
- POST /admin/returns/:id/reject — @Roles('ADMIN')

DOSYA #122: dispute.controller.ts
- POST /orders/:id/dispute — authenticated, anlaşmazlık aç
- GET /disputes — authenticated, anlaşmazlıklarım
- GET /disputes/:id — authenticated, anlaşmazlık detayı
- POST /admin/disputes/:id/resolve — @Roles('ADMIN'), çözümle

DOSYA #123: commerce-admin.controller.ts
- @Roles('ADMIN', 'SUPER_ADMIN')
- GET /admin/orders — tüm siparişler (paginated, filtrelenebilir)
- GET /admin/orders/:id — sipariş detayı
- PATCH /admin/orders/:id/status — durumu manuel değiştir
- GET /admin/returns — tüm iade talepleri
- GET /admin/disputes — tüm anlaşmazlıklar
- GET /admin/orders/stats — sipariş istatistikleri (toplam gelir, sipariş sayısı, iptal oranı)

=== MODULE REGISTRATION ===

DOSYA #124: apps/backend/src/modules/commerce/commerce.module.ts
- imports: PrismaModule, CqrsModule, SharedMessagingModule, FinancialGatewayModule, InventoryModule, CatalogModule
- providers: tüm repository'ler, command/query handler'lar, event handler'lar,
  CheckoutService, PricingService, OrderNumberService, OrderStateMachine, CommerceEventPublisher
- controllers: tüm controller'lar

DOSYA #125: apps/backend/src/app-components.ts (GÜNCELLE)
- CORE grubuna FinancialGatewayModule ekle (diğer modüllerden önce yüklenmeli)
- MARKET grubuna CommerceModule ekle

DOSYA #126: apps/backend/src/app.module.ts (GÜNCELLE — gerekiyorsa)
```

### EK GÖREV

Tüm dosyaları yazdıktan sonra, projenin `pnpm build` komutuyla hatasız derlenmesi için gereken adımları listele:
1. Yeni eklenen dependency'ler (pnpm install komutu)
2. Prisma generate komutu
3. Eksik barrel export'lar (index.ts güncellemeleri)
4. app.module.ts ve app-components.ts güncellemeleri
5. gRPC proto path konfigürasyonu

### KONTROL

Tüm dosyaları yazdıktan sonra şunları kontrol et:
1. FinancialGateway sadece facade mı — kendi iş mantığı YOK mu?
2. Checkout akışı tek transaction içinde mi (stok + escrow + order)?
3. OrderStateMachine: geçersiz durum geçişi engelliyor mu?
4. Cancel akışında stok serbest bırakılıyor VE escrow refund ediliyor mu?
5. Return approve'da FinancialGateway.refundFunds çağrılıyor mu?
6. Dispute resolve'da resolutionType'a göre doğru finansal işlem yapılıyor mu?
7. Her durum değişikliğinde OrderStatusHistory yazılıyor mu?
8. OrderItem'da listing bilgileri snapshot olarak kaydediliyor mu (fiyat, isim, görsel)?
9. Cart'ta aynı listing varsa quantity artıyor mu (duplicate item yok)?
10. Decimal kullanımı — float sızmamış mı?
11. gRPC timeout ve retry var mı?
12. TypeScript strict mode'da derlenir mi?

Sorun varsa düzelt ve açıkla.

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

126 dosya. Parçalı verme planı:

- Birinci mesaj: Dosya #1 — #8 (Prisma + FinancialGateway modülü)
- İkinci mesaj: Dosya #9 — #39 (Commerce Domain + Application Services)
- Üçüncü mesaj: Dosya #40 — #74 (Commerce DTOs + Commands part 1: cart, checkout, confirm, ship, deliver, complete)
- Dördüncü mesaj: Dosya #75 — #103 (Commands part 2: cancel, return, dispute + Event Handlers)
- Beşinci mesaj: Dosya #104 — #126 (Infrastructure + Presentation + Module Registration)

Her parçada system prompt'u TEKRAR VER.

Bu fazla Faz 4 tamamlanmış olur. Faz 5 (Barter + Auction) sırada.

REVIEW EDECEĞİM KRİTİK NOKTALAR:
- Checkout transaction atomicity — stok reserve + escrow hold tek transaction'da mı?
- Order state machine — geçersiz geçişler engelleniyor mu?
- Cancel akışı — stok + escrow rollback tam mı?
- FinancialGateway — iş mantığı sızmamış mı, saf facade mı?
- gRPC error handling — timeout/retry doğru mu?
- OrderItem snapshot — listing silinse/değişse bile order doğru veriyi koruyor mu?
