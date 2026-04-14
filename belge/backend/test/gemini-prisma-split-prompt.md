# Gemini Prompt — Prisma Schema Multi-File Bölme

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior NestJS/Prisma developer'sın. BarterBorsa projesindeki 2514 satırlık
tek Prisma schema dosyasını multi-file yapıya böleceksin.

TEKNİK BİLGİ:
- Prisma 5.22+ multi-file schema destekliyor
- Tek bir klasör altındaki tüm .prisma dosyaları otomatik birleştirilir
- datasource ve generator SADECE BİR dosyada tanımlanmalı
- Enum'lar hangi dosyada tanımlanırsa tanımlansın, tüm dosyalardan erişilebilir
- Model'ler arası relation'lar farklı dosyalarda olabilir — Prisma otomatik çözer

KURALLAR:
1. Mevcut schema'daki HİÇBİR model, enum, relation, index veya @@map değiştirilmeyecek
2. Sadece BÖLME yapılacak — içerik aynı kalacak
3. Her dosyanın başına yorum olarak path yazılacak
4. datasource ve generator SADECE base.prisma'da olacak
5. Her dosya kendi başına okunabilir olacak (ilgili enum'lar aynı dosyada)
```

### GÖREV

```
Aşağıda vereceğim mevcut schema.prisma dosyasının TAMAMINI oku ve şu dosyalara böl:

prisma/schema/
├── base.prisma          # SADECE datasource + generator
├── identity.prisma      # User, UserProfile, UserAddress, RefreshToken, Session, SSOToken, LoginHistory, VerificationToken + enum'ları (UserRole, UserStatus, Platform)
├── vendor.prisma        # Company, CompanyUser, Vendor, VendorProfile, VendorSettings, VendorB2BData, VendorMetrics, VendorFinancials, VendorStats, VendorBanner, VendorFollower, VendorBankAccount, VendorCategory, BrandEcosystem, EcosystemAuditLog, Subscription + enum'ları (VendorStatus, VendorTier, B2BTier, AdStatus, PilotCity)
├── catalog.prisma       # CatalogModel, CatalogProduct, Category, Brand, BrandViolation, ProductType, Listing, ListingImage, ListingPriceHistory, ListingStats, ListingAnalytic, ProductMedia, Review, Favorite, CategoryAttribute, BadgeRule, ProductEmbedding + enum'ları (ListingStatus, ListingVisibility, ProductCondition, BrandStatus, CategoryType)
├── inventory.prisma     # Warehouse, Stock, PurchaseOrder, PurchaseOrderItem, Transfer, TransferItem, InventoryLog + enum'ları (PurchaseOrderStatus, TransferStatus)
├── commerce.prisma      # Order, OrderItem, Cart, CartItem, OrderStatusHistory, OrderReturn, Dispute, Campaign, Coupon, GroupBuy, ExternalInventorySync, Collection, CollectionProduct + enum'ları (OrderStatus, DisputeStatus, CampaignType, PaymentMethod, PaymentStatus)
├── barter.prisma        # SurplusCategory, SurplusItem, WantedItem, DemandMatch, TradeOffer, TradeOfferItem, SwapSession, BarterPart, TradeCompletion, TradeReview, TradeChain, TradeMatch, BarterDisputeLog + enum'ları (SurplusStatus, WantedItemStatus, WantedItemType, ListingType, TradeOfferStatus, SwapSessionStatus, BarterPartStatus, DemandMatchStatus, DemandMatchType, TradeChainStatus, ArbitratorType)
├── auction.prisma       # Auction, AuctionWinner, AuctionParticipation, AuctionBid, Lottery, LotteryTicket + enum'ları (AuctionStatus, ParticipationStatus, LotteryStatus)
├── communication.prisma # ChatRoom, ChatMessage, Notification, UserComplaint + enum'ları (ChatRoomStatus, ChatMessageType, ComplaintStatus)
├── content.prisma       # HomeBanner, HomeQuadCard, HomeQuadCardItem, HelpCategory, HelpArticle, Announcement, Policy, DynamicContent, SeoMetadata + enum'ları (ArticleStatus)
├── advertising.prisma   # AdCampaign, AdSlot, AdSlotToAdCampaign, AdCampaignProduct, AdCampaignMetric, AdLocation, SideAd + enum'ları (AdType, AdSlotType, BillingModel, PricingModel, TargetRole)
├── loyalty.prisma       # UserLevel, XpTransaction, XpBatch, Mission, UserMission, MilestoneTracker, LoyaltyTierHistory, XpDistributionRule, XpSpendingLimitRule, PlatinumMissionLog, XPHistory + enum'ları (LoyaltyTier, UserTier)
├── analytics.prisma     # AnalyticsEvent, ProductActivity
└── system.prisma        # AuditLog, SecurityLog, AdminAuditLog, Setting, SystemSetting, LogisticSystem, DocumentArchive, LegalDocument, NewsletterSubscription, City, District + enum'ları (LogSeverity)

ÖNEMLİ KURALLAR:

1. base.prisma SADECE şunu içerecek:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
   }
   ```

2. Her dosya kendi model'leri ve ilişkili enum'ları içerecek.

3. Bir enum SADECE BİR dosyada tanımlanacak — duplicate enum YASAK.

4. Eğer bir enum birden fazla modül tarafından kullanılıyorsa (örn: Platform enum'u identity ve content'te kullanılıyor), enum'u ASIL SAHİBİ olan dosyaya koy. Prisma tüm dosyaları birleştirdiği için erişim sorunu olmaz.

5. Model'ler arası cross-file relation'lar SORUN DEĞİL — Prisma otomatik çözer. Örneğin:
   - vendor.prisma'daki Vendor modeli, identity.prisma'daki User'a userId ile referans veriyorsa sorun yok
   - catalog.prisma'daki Listing, vendor.prisma'daki Vendor'a relation tanımlıyorsa sorun yok
   Çünkü Prisma tüm .prisma dosyalarını tek schema olarak birleştirir.

6. Mevcut schema'da NE VARSA AYNEN koru:
   - Tüm @map() annotation'ları
   - Tüm @@map() annotation'ları
   - Tüm @@index() tanımları
   - Tüm @default() değerleri
   - Tüm @db.Decimal() hassasiyetleri
   - Tüm @relation() tanımları
   - Tüm @@unique() constraint'leri
   - Tüm @@id() composite key'leri
   - Yorum satırları (/// ile başlayanlar dahil)

7. Eğer mevcut schema'da bulamadığın bir model/enum varsa (yukarıdaki listede var ama schema'da yok), O DOSYAYI BOŞ BIRAK veya sadece mevcut olanları yaz. Olmayan model/enum EKLEME.

8. Eğer mevcut schema'da yukarıdaki listede OLMAYAN model/enum varsa, en uygun dosyaya koy. Hiçbirine uymuyorsa system.prisma'ya koy.
```

### ÇIKTI FORMATI

Her dosyayı şu formatta yaz:

```
=== DOSYA: prisma/schema/[dosya_adı].prisma ===

[dosya içeriği]

=== DOSYA SONU ===
```

Tüm dosyaları sırayla yaz. Hiçbir model veya enum ATLAMA.

### DOĞRULAMA

Tüm dosyaları yazdıktan sonra şu kontrolleri yap:

1. Mevcut schema'daki toplam model sayısını say → bölünmüş dosyalardaki toplam model sayısı EŞİT olmalı
2. Mevcut schema'daki toplam enum sayısını say → bölünmüş dosyalardaki toplam enum sayısı EŞİT olmalı
3. Hiçbir model veya enum iki dosyada tekrar tanımlanmamış olmalı (duplicate kontrolü)
4. base.prisma'da model veya enum OLMAMALI (sadece datasource + generator)
5. Her dosyada en az 1 model veya enum olmalı (boş dosya olmamalı — analytics.prisma hariç, o sadece 2 model içerebilir)

Kontrol sonuçlarını şu formatta yaz:
```
DOĞRULAMA:
- Mevcut schema model sayısı: X
- Bölünmüş dosyalar model sayısı: X ✅/❌
- Mevcut schema enum sayısı: X
- Bölünmüş dosyalar enum sayısı: X ✅/❌
- Duplicate model: YOK ✅ / VAR ❌ (varsa listele)
- Duplicate enum: YOK ✅ / VAR ❌ (varsa listele)
- base.prisma sadece datasource+generator: ✅/❌
```

---

## YAPIŞTIRILACAK PROMPT BİTİŞ

---

## NOTLAR (senin için, Gemini'ye yapıştırma)

ADIM 1: Yukarıdaki prompt'u Gemini'ye yapıştır.

ADIM 2: Hemen ardından mevcut schema.prisma'nın TAMAMINI yapıştır:
```bash
cat apps/backend/prisma/schema.prisma
```
Bu çıktıyı Gemini'ye "İşte mevcut schema.prisma — bunu böl:" diyerek gönder.

Gemini keserse: "Devam et, kaldığın dosyadan devam et" de.

ADIM 3: Gemini'nin ürettiği dosyaları oluştur:
```bash
mkdir -p apps/backend/prisma/schema
```
Her dosyayı ilgili path'e kaydet.

ADIM 4: Eski schema'yı yedekle:
```bash
mv apps/backend/prisma/schema.prisma apps/backend/prisma/schema.prisma.bak
```

ADIM 5: package.json'a prisma schema path ekle:
apps/backend/package.json dosyasına şu key'i ekle (scripts'in yanına):
```json
"prisma": {
  "schema": "prisma/schema"
}
```

ADIM 6: Prisma generate ve build:
```bash
cd apps/backend && npx prisma generate
cd ../.. && pnpm build
```

ADIM 7: Test:
```bash
cd apps/backend && pnpm start:dev
# Ayrı terminal:
curl http://localhost:3001/health
curl http://localhost:3001/ready
```

ADIM 8: Her şey çalışıyorsa backup'ı sil:
```bash
rm apps/backend/prisma/schema.prisma.bak
```

Sorun çıkarsa: hata logunu Claude'a gönder.
