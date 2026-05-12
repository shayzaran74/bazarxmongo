# ADR-003: gRPC Neden REST Yerine?

**Durum:** Kabul Edildi  
**Tarih:** 2024-04-01

---

## Bağlam

BazarX backend'i iki ana service olarak ayrılıyor:
- **Backend (NestJS)**: API, business logic, CQRS
- **Financial Service (gRPC)**: Cüzdan, escrow, ödeme

İki servis arasında **senkron iletişim** gerekiyor:
- Checkout: Cüzdandan hold yap
- Takas: Teminatı bloke et
- Withdrawal: Para çekme onayı

---

## Karar

**gRPC** (Remote Procedure Call) kullanılmasına karar verildi.

### Neden gRPC?

| Kriter | REST | gRPC |
|--------|------|------|
| **Performans** | JSON parse overhead | Protobuf binary (3-10x faster) |
| **Tip güvenliği** | OpenAPI schema gerekir | `.proto` ile otomatik |
| **Streaming** | Server-Sent Events gerekir | Native bidirectional streaming |
| **Bağlantı** | Her istekte yeni connection | HTTP/2 persistent |
| **Mobile desteği** | İyi | Sınırlı ( Flutter/React Native'de zor) |

### Financial Service Proto
```protobuf
service FinancialService {
  rpc GetBalance(GetBalanceRequest) returns (GetBalanceResponse) {}
  rpc HoldFunds(HoldFundsRequest) returns (HoldFundsResponse) {}
  rpc ReleaseFunds(ReleaseFundsRequest) returns (ReleaseFundsResponse) {}
  rpc RefundFunds(RefundFundsRequest) returns (RefundFundsResponse) {}
  // ... 16+ RPC method
}
```

### Neden REST DEĞİL?
- **Performans**: High-frequency financial calls (balance check, hold/release)
- **Type safety**: Proto + ts-proto ile otomatik TypeScript client
- **Connection reuse**: HTTP/2 multiplexing

### Dezavantajlar
- **Browser desteği yok**: Direct browser call mümkün değil
- **Human-readable değil**: Debug için Postman/Insomnia gerekli
- **Mobile SDK**: Flutter/React Native'de ek entegrasyon gerekiyor

---

## Sonuçlar

### Olumlu
- Backend ↔ Financial-Service arasında type-safe, high-performance iletişim
- gRPC health check ile service reliability
- Circuit breaker pattern ile graceful degradation

### Olumsuz
- Financial-service down = backend kritik işlemler fail
- **ÇÖZÜM**: Circuit breaker (opossum) + fallback response eklendi

---

## İlişkili Kararlar

- [ADR-001](adr-001-postgresql-prisma.md): PostgreSQL + Prisma
- [ADR-002](adr-002-rabbitmq-queues.md): RabbitMQ Event Bus
