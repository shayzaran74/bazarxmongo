# ADR-001: PostgreSQL 16 + Prisma ORM Seçimi

**Durum:** Kabul Edildi  
**Tarih:** 2024-04-01

---

## Bağlam

BazarX, e-ticaret ve ticari takas platformu olarak karmaşık ilişkisel veri yapılarına ihtiyaç duyar:
- Ürün katalogları (CatalogProduct ↔ Listing ↔ Category)
- Sipariş ve ödeme ilişkileri (Order ↔ OrderItem ↔ Invoice)
- Vendor ve ekosistem yapıları (Vendor ↔ Company ↔ BrandEcosystem)
- Sadakat ve XP sistemleri (User ↔ XpTransaction ↔ MembershipTier)

Aynı anda 112+ model içeren tek bir veritabanı şeması olacak.

---

## Karar

**PostgreSQL 16** veritabanı ve **Prisma ORM** kullanılmasına karar verildi.

### Neden PostgreSQL?
- **JSON desteği**: Esnek schema ihtiyaçları için (product.attributes, settings)
- **ACID uyumluluğu**: Finansal işlemler için kritik
- **PostgreSQL 16 yenilikleri**: JSON_TABLE, MERGE,增量备份 avantajları
- **gRPC + Prisma**: financial-service ile aynı PostgreSQL 16 kullanılıyor

### Neden Prisma?
- **Type-safe queries**: `prisma.order.findMany()` tip güvenliği
- **Migration sistemi**: Schema değişiklikleri version kontrolünde
- **Nested writes**: İlişkili kayıtları tek transaction'da oluşturma
- **Raw SQL desteği**: Karmaşık sorgular için `prisma.$queryRaw`

### Neden MONGO DB DEĞİL?
- **Ticari takas için relation kritik**: SwapSession ↔ TradeOffer ↔ BarterPart ilişkileri
- **Ecosystem zincirleme sorguları**: Vendor → Listing → Order karmaşık join gerektiriyor
- **Prisma kurumsal bilgi birikimi**: Ekip PostgreSQL deneyimi yüksek

---

## Sonuçlar

### Olumlu
- Type-safe database queries, compile-time hata yakalama
- Migration ile schema version kontrolü
- Nested transaction desteği (checkout, escrow akışları)
- JSON column desteği ile esneklik

### Olumsuz
- **Single server limitation**: Çok büyük ölçeklerde sharding gerekebilir
- **Prisma client singleton**: Her modülde ayrı instance oluşturma riski (ÇÖZÜLDÜ: PrismaModule global)
- **Schema boyutu**: 112+ model tek dosyada → bakım zorluğu (modüler yapı ile hafifletildi)

---

## İlişkili Kararlar

- [ADR-002](adr-002-rabbitmq-queues.md): RabbitMQ + Dead Letter Queue
- [ADR-003](adr-003-grpc-vs-rest.md): gRPC Neden REST Yerine
