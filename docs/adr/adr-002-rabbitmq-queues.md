# ADR-002: RabbitMQ + Dead Letter Queue Event Bus

**Durum:** Kabul Edildi  
**Tarih:** 2024-04-01

---

## Bağlam

BazarX'te birçok modül birbirine loose-coupled iletişim kurmalı:
- **Checkout tamamlandı** → Bildirim gönder, XP güncelle, loyalty hesapla
- **Vendor onaylandı** → Email gönder, dashboard güncelle, barterEnabled yap
- **Takas teklifi kabul edildi** → Escrow hold yap, notification gönder

Bu olaylar **senkron değil asenkron** olarak işlenmeli — sipariş oluşturma işlemi bildirim göndermeye bağlı olmamalı.

---

## Karar

**RabbitMQ 3.13** event bus ve **Dead Letter Queue** pattern kullanılmasına karar verildi.

### Neden RabbitMQ?
- **Topic exchange**: Routing key ile esnek mesaj yönlendirme (`order.created`, `vendor.approved`)
- **Durable queue**: Mesajlar diskte saklanır, broker restart sonrası kaybolmaz
- **Consumer acknowledgment**: Mesaj işlenene kadar queue'da kalır
- **@golevelup/nestjs-rabbitmq**: NestJS native entegrasyon

### Neden Topic Exchange?
```typescript
// Routing key örnekleri
'order.created'
'order.cancelled'
'vendor.approved'
'barter.offer.accepted'
'loyalty.xp.earned'
```

### Dead Letter Queue Yapılandırması
```typescript
exchanges: [
  { name: 'identity.events', type: 'topic' },
  { name: 'commerce.events', type: 'topic' },
  { name: 'financial.events', type: 'topic' },
  { name: 'barter.events', type: 'topic' },
  // Dead letter exchange — işlenemez mesajlar buraya gider
  { name: 'financial.dead-letter', type: 'topic' },
]
```

---

## Sonuçlar

### Olumlu
- Loose coupling: Modüller birbirinden bağımsız çalışır
- Asenkron işleme: Ana akış bloke olmaz
- Event sourcing hazırlığı: Tüm event'ler loglanabilir
- Consumer'lar ayrı scale edilebilir

### Olumsuz
- **Eventual consistency**: Mesaj gecikmeleri olabilir
- **Duplicate handling**: Aynı event birden fazla consumer'da işlenebilir (idempotent olmalı)
- **Debug zorluğu**: Fire-and-forget pattern'te mesaj kaybı zor tespit edilir

---

## Kritik Düzeltme: Outbox Pattern

**Sorun**: RabbitMQ publish işlemi DB transaction sonrasında yapılıyordu. Eğer mesaj publish edilemezse, event kayboluyordu — sipariş oluşuyor ama bildirim gitmiyordu.

**Çözüm**: Transactional Outbox Pattern
1. Event, DB transaction içinde `OutboxMessage` tablosuna yazılır
2. Background processor (her 5 saniyede) pending event'leri RabbitMQ'ya publish eder
3. Başarısız olursa retry (max 3), sonra `FAILED` status

```typescript
// checkout.service.ts
await this.prisma.$transaction(async (tx) => {
  // Sipariş oluştur
  await tx.order.create({...});
  // Outbox'a event yaz (aynı transaction)
  await tx.outboxMessage.create({
    data: { aggregateId: order.id, eventType: 'order.created', ... }
  });
});
```

---

## İlişkili Kararlar

- [ADR-001](adr-001-postgresql-prisma.md): PostgreSQL + Prisma
- [ADR-003](adr-003-grpc-vs-rest.md): gRPC Neden REST Yerine
