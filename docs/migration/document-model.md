# Doküman Modeli — Embed vs Reference Kararları

> **Referans:** ADR-005 §1b. Her aggregate root için göç ÖNCESİ karar verilmiştir.

**Karar Kuralları:**
- **Embed:** Child sadece parent ile birlikte sorgulanıyor + kanıtlanabilir sınırlı sayı (maxEmbedSize: 100)
- **Reference:** Child bağımsız sorgulanıyor veya sayısı sınırsız/büyük

---

## BACKEND — 129 Model Kararları

### Identity & Auth (9 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `User` | **Reference** | Bağımsız sorgulanır, milyonlarca kullanıcı — embed mantıksız |
| `UserProfile` | **Embed (User içinde)** | 1:1 ilişki — ayrı collection saçma. `User.profile: UserProfileSubdoc` |
| `UserAddress` | **Reference** | Çok adres — kullanıcı kendi adreslerini bağımsız listeler |
| `RefreshToken` | **Embed (User içinde)** | Token listesi — backend sadece userId ile sorgular, ayrı tablo yok |
| `Session` | **Embed (User içinde)** | Aktif session'lar — kullanıcı logout yapınca silinir, ayrı sorgulanmaz |
| `LoginHistory` | **Reference** | Sonsuz log — ayrı collection, `User.loginHistory: LoginHistoryRef[]` |
| `VerificationToken` | **Embed (User içinde)** | Geçici token — parent silinince otomatik gitmeli |
| `SSOToken` | **Embed (User içinde)** | Nadir, geçici — User'a gömülü |
| `Company` | **Reference** | Bağımsız entity — Vendor'lar ayrı erişir |

### Company & Vendor (8 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `CompanyUser` | **Reference** | Join table — many-to-many, ayrı sorgulanabilir |
| `Vendor` | **Reference** | Ana aggregate — ayrı collection şart |
| `VendorProfile` | **Embed (Vendor içinde)** | 1:1 — ayrı tablo gereksiz. `Vendor.profile: VendorProfileSubdoc` |
| `VendorSettings` | **Embed (Vendor içinde)** | 1:1 — ayrı tablo gereksiz |
| `VendorB2BData` | **Embed (Vendor içinde)** | 1:1 — B2B verisi sadece vendor ile birlikte gelir |
| `VendorMetrics` | **Reference** | Zamanla büyür — embed 16MB riski |
| `VendorStats` | **Embed (Vendor içinde)** | Günlük özet — küçük, stable boyut |
| `VendorBankAccount` | **Embed (Vendor içinde)** | Banka bilgisi — nadir değişir, 1:1 |
| `VendorCategory` | **Reference** | Vendor-Category join — many-to-many |
| `VendorBanner` | **Reference** | Çok banner — ayrı collection |
| `VendorFollower` | **Reference** | Join table — takipçi sayısı büyür |
| `BrandEcosystem` | **Reference** | Aggregate root — ayrı collection şart |
| `EcosystemAuditLog` | **Reference** | Audit log — büyür, ayrı collection |

### Subscription & Membership (4 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `Subscription` | **Reference** | Company'ye bağlı ama ayrı lifecycle |
| `MembershipPlan` | **Reference** | Sistemsel reference data — embed yerine DB'de durur |
| `UserSubscription` | **Reference** | User-Plan ilişkisi — ayrı sorgulanır |
| `MembershipTier` | **Reference** | Enum değil — fiyat/özellik içeren entity |
| `LaunchPartner` | **Reference** | Phase ilerlemesi — ayrı collection |

### Catalog & Listing (14 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `CatalogModel` | **Reference** | Product template — ayrı collection |
| `CatalogProduct` | **Reference** | Product definition —独立查询 |
| `Category` | **Reference** | Hiyerarşik — tree yapısı için ayrı collection şart |
| `Brand` | **Reference** | Bağımsız — vendor'lar ayrı erişir |
| `BrandViolation` | **Reference** | Audit log benzeri — büyür |
| `ProductType` | **Reference** | Sistemsel — az sayıda, ayrı collection |
| `Listing` | **Reference** | Ana aggregate — ayrı collection |
| `ListingImage` | **Reference** ⚠️ | Çok resim — OrderItem embed kararı sonrası kontrol |
| `ListingPriceHistory` | **Reference** | Fiyat geçmişi büyür — ayrı collection |
| `ListingStats` | **Embed (Listing içinde)** | Tek satırlık özet — embed yeterli |
| `ListingAnalytic` | **Reference** | Analytics events — büyür |
| `ProductMedia` | **Reference** | Medya collection — büyür |
| `CategoryAttribute` | **Embed (Category içinde)** | Kategori başına sabit özellikler — küçük |
| `Collection` | **Reference** | Collection ayrı, ürünler join table ile bağlı |
| `CollectionProduct` | **Reference** | Join table |

### Commerce — Order & Cart (8 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `Order` | **Reference** | Ana aggregate — ayrı collection |
| `OrderItem` | **Embed (Order içinde)** ⭐ | Sipariş snapshot — immutable, her zaman Order ile birlikte |
| `OrderStatusHistory` | **Embed (Order içinde)** | Status geçmişi — küçük, Order ile birlikte |
| `OrderReturn` | **Reference** | İade ayrı lifecycle — ayrı collection |
| `Cart` | **Reference** | Ana aggregate |
| `CartItem` | **Embed (Cart içinde)** ⭐ | Cart kapanınca silinir — ayrı sorgulanmaz |
| `Dispute` | **Reference** | Ayrı lifecycle — Order ile loosely coupled |

### Inventory & Stock (7 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `Warehouse` | **Reference** | Fiziksel entity |
| `Stock` | **Reference** | Stock bağımsız sorgulanır — listing'ten ayrı |
| `StockReservation` | **Reference** | Reservation lifecycle — ayrı collection |
| `PurchaseOrder` | **Reference** | Tedarikçi siparişi — ayrı aggregate |
| `PurchaseOrderItem` | **Embed (PurchaseOrder içinde)** ⭐ | PO ile birlikte immutable |
| `Transfer` | **Reference** | Depolar arası transfer — ayrı aggregate |
| `TransferItem` | **Embed (Transfer içinde)** ⭐ |
| `InventoryLog` | **Reference** | Audit trail — büyür |

### Auction & Bidding (4 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `Auction` | **Reference** | Ana aggregate |
| `AuctionBid` | **Reference** ⭐ | Açık artırma bid history — büyür, ayrı collection |
| `AuctionParticipation` | **Reference** | Her katılımcı ayrı kayıt |
| `AuctionWinner` | **Reference** | Kazanan ataması — ayrı collection |

### Lottery (2 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `Lottery` | **Reference** | Ana aggregate |
| `LotteryTicket` | **Reference** ⚠️ | Kullanıcı bileti sorgular, ayrı collection |

### Barter & Trade (12 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `SurplusCategory` | **Reference** | Sistemsel reference data |
| `SurplusItem` | **Reference** | Ana aggregate |
| `WantedItem` | **Reference** | Aranan ürünler — ayrı collection |
| `DemandMatch` | **Reference** | Matching log — büyür |
| `TradeOffer` | **Reference** | Ana aggregate — teklifler ayrı sorgulanır |
| `TradeOfferItem` | **Embed (TradeOffer içinde)** ⭐ | Teklif kalemleri — snapshot |
| `SwapSession` | **Reference** | Ana aggregate — state machine |
| `BarterPart` | **Embed (SwapSession içinde)** ⭐ | Taraflar az — embed yeterli |
| `TradeCompletion` | **Reference** | Tamamlanma log |
| `TradeReview` | **Reference** | Değerlendirme — ayrı collection |
| `TradeChain` | **Reference** | Zincirleme takas — ayrı aggregate |
| `TradeMatch` | **Reference** | Match log |
| `BarterDisputeLog` | **Reference** | Dispute geçmişi |

### Financial — XP & Loyalty (8 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `MembershipTier` | **Reference** | Enum gibi ama fiyat/özellik barındırır |
| `UserLevel` | **Reference** | XP seviyesi — ayrı collection |
| `XpTransaction` | **Reference** ⚠️ | Büyür, user ayrı sorgular — ayrı collection |
| `XpBatch` | **Reference** | Batch işlemleri |
| `Mission` | **Reference** | Görevler sabit |
| `UserMission` | **Reference** | Kullanıcı görev takibi |
| `MilestoneTracker` | **Reference** | milestone log |
| `LoyaltyTierHistory` | **Reference** | Tier geçmişi |
| `XpDistributionRule` | **Reference** | Sistemsel |
| `XpSpendingLimitRule` | **Reference** | Sistemsel |
| `PlatinumMissionLog` | **Reference** | Log |

### Gift & Referral (4 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `GiftVoucher` | **Reference** | Kod ile sorgulanır — ayrı collection |
| `Referral` | **Reference** | Ağ yapısı — büyür |
| `Coupon` | **Reference** | Kod ile sorgulanır |
| `EscrowCoupon` | **Reference** | Escrow işlemleri |

### Marketing & Ad (8 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `Campaign` | **Reference** | Ana aggregate |
| `GroupBuy` | **Reference** | Grup alışverişi |
| `HomeBanner` | **Reference** | Banner ayrı |
| `HomeQuadCard` | **Reference** | Quad card ayrı |
| `HomeQuadCardItem` | **Embed (HomeQuadCard içinde)** ⭐ | Card'a bağlı item |
| `AdCampaign` | **Reference** | Reklam kampanyası |
| `AdCampaignProduct` | **Reference** | Join table |
| `AdSlot` | **Reference** | Slot ayrı |
| `AdLocation` | **Reference** | Location ayrı |
| `SideAd` | **Reference** | Side ad ayrı |
| `AdCampaignMetric` | **Reference** | Metrics büyür |

### Menu & Restaurant (4 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `MenuUsage` | **Reference** | Kullanım log |
| `MenuPurchase` | **Reference** | Purchase record |
| `MenuRedemption` | **Reference** | Redemption log |
| `Review` | **Reference** | Yorumlar büyür |

### Trust & Blind Pool (3 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `TrustScore` | **Reference** | Vendor/User skor — ayrı aggregate |
| `BlindPool` | **Reference** | Ana aggregate |
| `BlindPoolEntry` | **Embed (BlindPool içinde)** ⭐ | Pool dışında entry sorgusu yok — embed ideal |

### Outbox & System (7 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `OutboxMessage` | **Reference** | Event outbox — ayrı collection |
| `AuditLog` | **Reference** | Audit trail — büyür |
| `SystemSetting` | **Reference** | Key-value store |
| `DeliveryDispatch` | **Reference** | Delivery aggregate |
| `ImportJob` | **Reference** | Import işlemleri |
| `Invoice` | **Reference** | Fatura ayrı |
| `InvoiceItem` | **Embed (Invoice içinde)** ⭐ | Fatura kalemleri |

### Analytics & Chat (6 model)

| Model | Karar | Gerekçe |
|---|---|---|
| `AnalyticsEvent` | **Reference** | Events büyür |
| `ProductActivity` | **Reference** | Activity log |
| `ChatRoom` | **Reference** | Chat room ayrı |
| `ChatMessage` | **Reference** | Mesajlar büyür |
| `Notification` | **Reference** | Notification ayrı |
| `UserComplaint` | **Reference** | Şikayet ayrı |

---

## FINANCIAL-SERVICE — 21 Model Kararları

| Model | Karar | Gerekçe |
|---|---|---|
| `Wallet` | **Reference** | User başına tek wallet — ayrı collection |
| `Account` | **Reference** | Hesap türü başına — ayrı collection |
| `AccountTransaction` | **Reference** ⚠️ | Büyür — ayrı collection, ledger entry gibi |
| `AccountHold` | **Reference** | Bloke kayıtları — ayrı collection |
| `AccountTopUpRequest` | **Reference** | Para yükleme talepleri |
| `AccountWithdrawalRequest` | **Reference** | Çekim talepleri |
| `GeneralLedger` | **Reference** ⚠️ | Ledger büyür |
| `UserLedgerEntry` | **Reference** ⚠️ | User ledger büyür |
| `Payment` | **Reference** | Ödeme kayıtları |
| `Escrow` | **Reference** | Escrow işlemleri |
| `TransactionHistory` | **Reference** ⚠️ | Büyür |
| `GiftCard` | **Reference** | Kod ile sorgulanır |
| `GiftCardTransaction` | **Reference** | Transaction log |
| `WithdrawalVerification` | **Reference** | Doğrulama kayıtları |
| `IdempotencyKey` | **Reference** | Idempotency log |
| `DownPaymentPolicy` | **Reference** | Policy ayrı |
| `OutboxMessage` | **Reference** | Outbox |
| `MembershipTier` | **Reference** | Enum değil |
| `TierBenefit` | **Reference** | Benefit ayrı |
| `AuditLog` | **Reference** | Audit log |
| `CommissionRecord` | **Reference** ⚠️ | Commission history büyür |

---

## Özet — Embed Edilecekler (15 parent, 25+ child)

| Parent | Embedded Children |
|---|---|
| `User` | `UserProfile`, `RefreshToken[]`, `Session[]`, `VerificationToken[]`, `SSOToken[]` |
| `Company` | `VendorProfile`, `VendorSettings`, `VendorB2BData`, `VendorBankAccount` |
| `Listing` | `ListingStats` |
| `Order` | `OrderItem[]`, `OrderStatusHistory[]` |
| `PurchaseOrder` | `PurchaseOrderItem[]` |
| `Transfer` | `TransferItem[]` |
| `Cart` | `CartItem[]` |
| `HomeQuadCard` | `HomeQuadCardItem[]` |
| `Invoice` | `InvoiceItem[]` |
| `BlindPool` | `BlindPoolEntry[]` |
| `SwapSession` | `BarterPart[]` |
| `TradeOffer` | `TradeOfferItem[]` |
| `Category` | `CategoryAttribute[]` |

---

## 16MB Limit Kontrolü

** Kritik embed adayları — 100 item sınırı kontrol edilecek:**

- `Order.OrderItem[]` — B2B toptan sipariş 1000+ kalem olabilir ⚠️
- `Cart.CartItem[]` — Sepet genellikle <50
- `BlindPoolEntry[]` — Pool katılımı tipik <50
- `ListingImage[]` — <20
- `HomeQuadCardItem[]` — 4 sabit

**Guard:** `Order.addItem()` → `items.length >= MAX_ITEMS_PER_ORDER (100)` → `DomainException`

---

## Sonraki Adım

Bu kararlar `scripts/embed-refactor.ts` tarafından okunarak schema iskeletleri üretilir. `prisma-to-mongoose.ts` önce reference mode'da iskelet üretir, sonra `embed-refactor.ts` embed kararı uygulanır.