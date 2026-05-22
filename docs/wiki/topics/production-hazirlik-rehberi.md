---
title: "BazarX Production'a Çıkış Denetleme ve İyileştirme Rehberi"
type: topic
tags: [production, audit, devops, güvenlik, performans, nestjs, mongoose, eşzamanlılık, observability]
created: 2026-05-22
updated: 2026-05-22
---

# BazarX Production'a Çıkış Denetleme ve İyileştirme Rehberi

Bu döküman, BazarX marketplace ve kurumsal SaaS platformunun (NestJS backend, Nuxt 3 frontend, gRPC ve MongoDB/Mongoose veri katmanı) production ortamına geçişi öncesinde gerçekleştirilen denetim başlıklarını, giderilen kritik riskleri ve uygulanan düzeltmeleri içerir.

**Son Güncelleme:** 2026-05-22 — Commit `3f917bde`

---

## 1. Veritabanı & Mongoose Veri Katmanı Güvenliği

### 1.1 Replica Set ve Transaction Sağlamlığı
- **Durum:** **Doğrulandı**
- `session.withTransaction()` + `session.endSession()` ile multi-document transaction yapısı kuruludur.
- **Production Gereksinimi:** MongoDB kümesi minimum 3 node'lu **Replica Set** olarak çalışmalıdır.

### 1.2 İndeks Optimizasyonları (Query Performance)
- **Durum:** **İyileştirildi**
- `TradeOffer` şemasına `receiverId` indeksi eklendi.
- `User`, `Session`, `Order`, `SurplusItem` koleksiyonlarında `email`, `token`, `userId+status`, `expiresAt` (TTL) indeksleri doğrulandı.

### 1.3 Connection Pool Sizing & Timeout
- **Durum:** **Uygulandı**
- `maxPoolSize: 100`, `minPoolSize: 10`, `socketTimeoutMS: 45000`, `connectTimeoutMS: 30000`, `heartbeatFrequencyMS: 10000` yapılandırıldı.

---

## 2. Mikroservisler & gRPC Haberleşmesi (Resilience)

### 2.1 Circuit Breaker Stale Closure Hatası
- **Durum:** **Kritik Hata Düzeltildi**
- `CircuitBreakerService` içindeki statik closure sorunu giderildi. Wrapper `(runFn) => runFn()` olarak statikleştirildi, dynamic callback `breaker.fire(fn)` ile çağrı anında iletildi.

---

## 3. Asenkron Mesajlaşma (Outbox & RabbitMQ / BullMQ)

### 3.1 Outbox Retry ve DLQ Hata Alarmı
- **Durum:** **İyileştirildi**
- `FAILED` durumuna çekilen outbox mesajları artık `logger.error` ile raporlanıyor.

### 3.2 BullMQ Kuyruk Yönetimi
- **Durum:** **Doğrulandı**
- `removeOnComplete` ve `removeOnFail` limitleri tanımlı — Redis RAM sızıntısı engellendi.

---

## 4. Domain Bazlı Kod Denetim Bulguları

### 4.1 Açık Artırma (Auction)
- **Bulgu:** Bidding akışı katılım durumu, bakiye ve bloke mekanizmasını doğru işliyor.
- **Risk (ÇÖZÜLDÜ):** ~~`BaseMongoRepository.save()` OCC kullanmıyordu — race condition riski vardı.~~
- **Uygulanan Çözüm (Commit `<occ-commit>`):**
  - `AuctionSchema`'ya `version: { type: Number, default: 1 }` eklendi.
  - `base-mongo.repository.ts`'te `findOneAndUpdate({ id, version: currentVersion })` ile atomik OCC denetimi eklendi.
  - Version uyumsuzluğunda `ConcurrencyConflictException` fırlatılıyor.
  - Geriye dönük uyumlu: `version` alanı olmayan şemalarda eski davranış korunuyor.

### 4.2 Takas (Barter & B2B)
- **Güvence:** `accept-trade-offer.handler.ts` — iki taraflı bloke + compensation + `mongoSession.withTransaction` atomic DB yazımı.

### 4.3 Finans & Ödeme (Commerce & Payments)
- **Güvence:** `CreateEscrowHandler` — cüzdan + Ledger işlemleri tam MongoDB transaction altında.

### 4.4 Çekiliş (Lottery)
- **Risk (ÇÖZÜLDÜ):** ~~Bilet alım endpoint'i transaction dışında çalışıyordu; yüksek eşzamanlılıkta kota aşımı mümkündü.~~
- **Uygulanan Çözüm:**
  - Kota kontrolleri ve bilet kayıtları `connection.withTransaction()` içine alındı.
  - gRPC `holdFunds` transaction dışında tutuldu (Mongo transaction ile birleştirilemez).
  - DB commit başarısız olursa `releaseFunds(holdId)` compensation mekanizması devreye giriyor.
  - `ILotteryRepository` metodlarına `session?` parametresi eklendi.

### 4.5 Yönetim Paneli (Admin)
- Tüm admin controller'lar `JwtAuthGuard` + `RolesGuard` ile korunuyor. `AuditLogService` tüm kritik değişiklikleri kaydediyor.

### 4.6 Katalog (Product/Catalog)
- Buybox algoritması BullMQ üzerinden asenkron çalışıyor.

### 4.7 Tip Güvenliği & Validasyon
- `LotteryParticipateDto`, `PlaceBidDto` class-validator ile sıkı doğrulanıyor.

---

## 5. Güvenlik, Kimlik Doğrulama & Hız Limitleri

### 5.1 Nginx/Cloudflare IP Yönlendirmesi
- **Durum:** **Uygulandı** — `app.set('trust proxy', 1)` eklendi.

### 5.2 PII Redaction (Log Maskeleme)
- **Durum:** **Uygulandı** — `nestjs-pino` redact filtresiyle `authorization`, `cookie`, `password`, `creditCard`, `cvv` maskeleniyor.

### 5.3 CORS Güvenlik Güçlendirmesi ⭐ YENİ
- **Durum:** **Kritik Hata Düzeltildi**
- **Önceki Durum:** `CORS_ORIGIN` env boşken `origin: true` — tüm domain'ler credentials ile erişebiliyordu.
- **Düzeltme:** `origin: false` fallback. `methods` ve `allowedHeaders` explicit kısıtlandı.
- **İlgili Dosya:** `apps/backend/src/main.ts`

### 5.4 WebSocket CORS Güvenliği ⭐ YENİ
- **Durum:** **Düzeltildi**
- `WS_CORS_ORIGIN || '*'` → `WS_CORS_ORIGIN || false` — env boşsa WebSocket bağlantısı kabul edilmiyor.
- **İlgili Dosya:** `communication/infrastructure/websocket/chat.gateway.ts`

### 5.5 Nginx Security Header Eksiklikleri ⭐ YENİ
- **Durum:** **Düzeltildi**
- Eklenen header'lar:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **İlgili Dosya:** `nginx/conf.d/bazarx.conf`

### 5.6 Nginx Socket.io Yanlış Routing ⭐ YENİ
- **Durum:** **Kritik Hata Düzeltildi**
- **Önceki Durum:** `/socket.io/` → `frontend:3000` (yanlış!)
- **Düzeltme:** `/socket.io/` → `backend:3001` (ChatGateway burada çalışıyor)
- **İlgili Dosya:** `nginx/conf.d/bazarx.conf`

---

## 6. İzlenebilirlik (Observability & Monitoring)

### 6.1 Health Check (`/health`)
- **Durum:** **Uygulandı** — `/api/v1/health` MongoDB Replica Set + MinIO durumunu raporluyor.

### 6.2 Prometheus Metrics Endpoint ⭐ YENİ
- **Durum:** **Uygulandı**
- **Paket:** `prom-client`
- **Endpoint:** `GET /api/v1/metrics` (ADMIN/SUPERADMIN JWT korumalı)
- **Metrikler:**
  - `bazarx_http_requests_total` — method/route/status_code etiketi
  - `bazarx_http_request_duration_seconds` — histogram (8 bucket)
  - `bazarx_active_connections` — gauge
  - `bazarx_db_query_duration_seconds` — DB sorgu süresi
  - Node.js default metrikleri (`bazarx_` prefix)
- **İlgili Dosyalar:** `infrastructure/metrics/` (4 dosya)
- **Prometheus Config:** `infra/prometheus/prometheus.yml` zaten `backend:3001/metrics` scrape ediyor.

### 6.3 Sentry Hata Takibi ⭐ YENİ
- **Durum:** **Uygulandı**
- **Paket:** `@sentry/nestjs`, `@sentry/node`
- **Davranış:**
  - `SENTRY_DSN` env varsa aktif, yoksa pasif (dev'de gürültü yok)
  - **5xx hatalar** → `Sentry.captureException()` + user context
  - **4xx hatalar** → Sentry'e gitmiyor, sadece log
  - Production'da `tracesSampleRate: 0.1` (%10 trace)
- **İlgili Dosya:** `common/filters/sentry-exception.filter.ts`

### 6.4 Sessiz Catch Block'lar ⭐ YENİ
- **Durum:** **Düzeltildi**
- Düzeltilen dosyalar:
  - `track-event.handler.ts` — analytics hata artık `logger.warn` ile görünür
  - `badge-evaluator.helper.ts` — fallback log eklendi
  - `dispatch-notification.processor.ts` — `failed()` job hatası artık loglanıyor

---

## 7. Frontend Production Optimizasyonu (Nuxt 3)

### 7.1 SSR Stratejisi
- **Durum:** **Doğrulandı** — Hybrid SSR:
  - Public sayfalar (`/`, `/products/**`, `/search/**`) → `ssr: true`
  - Özel paneller (`/admin/**`, `/vendor/**`) → `ssr: false`

### 7.2 TypeScript typeCheck
- `typeCheck: false` (dev — OOM riski), `strict: true` korundu.
- Type kontrolü CI'da `nuxt build` adımında yapılıyor.

### 7.3 API Endpoint Düzeltmeleri ⭐ YENİ
- `useAdminVendors.ts` — 6 endpoint `/api/admin/vendors/` → `/api/v1/admin/vendors/`
- `useAdminContent.ts` — `console.error` kaldırıldı
- `nuxt.config.ts` — syntax hatası (virgül eksikliği) düzeltildi

---

## 8. Infrastructure & DevOps

### 8.1 Docker Compose Production ⭐ YENİ
- **Durum:** **Uygulandı**
- **Dosya:** `docker-compose.prod.yml` (önceden yoktu)
- **Servisler:** nginx, frontend, backend, financial-service, delivery-service, postgres, mongodb, redis, rabbitmq, minio
- **Güvenlik:** DB portları dışarıya açık değil (`expose` only). `mongo-express` production'da yok.
- **Logging:** JSON structured logging, `max-size: 10m, max-file: 3`

### 8.2 Environment Variables Şablonu ⭐ YENİ
- **Dosya:** `.env.prod.example` güncellendi
- Eklenen değişkenler: `CORS_ORIGIN`, `WS_CORS_ORIGIN`, `NUXT_PUBLIC_API_BASE`, `POSTGRES_*`, `MONGO_*`, `SENTRY_DSN`, `APP_VERSION`

### 8.3 CI/CD Pipeline
- **Durum:** **İyileştirildi**
- `--passWithNoTests` kaldırıldı — test dosyası yoksa CI artık kırmızı.
- Codecov entegrasyonu: sadece `main` push'ta coverage raporu.

---

## 9. Eşzamanlılık Güvenliği (Concurrency Safety) ⭐ YENİ

### 9.1 Açık Artırma OCC (Optimistic Concurrency Control)

**Problem:** `BaseMongoRepository.save()` — `findOne → update` pattern'i eşzamanlı tekliflerde race condition yaratıyordu.

**Çözüm:** `findOneAndUpdate({ id, version: currentVersion })` ile atomik OCC.

```
Teklif A gelir: version=1 → findOneAndUpdate({ id, version: 1 }) ✅ → version=2
Teklif B gelir: version=1 → findOneAndUpdate({ id, version: 1 }) ❌ → ConcurrencyConflictException
```

**Değiştirilen Dosyalar:**

| Dosya | Değişiklik |
|-------|-----------|
| `base-mongo.repository.ts` | OCC kilit logic + `ConcurrencyConflictException` |
| `auction.schema.ts` | `version: { type: Number, default: 1 }` alanı eklendi |
| `auction.mapper.ts` | `toDomain → _version`, `toPersistence → version` eşleştirmesi |

### 9.2 Çekiliş (Lottery) Atomik Transaction

**Problem:** `participate()` — kota kontrolü, para blokajı, bilet kayıt sırasız; yüksek eşzamanlılıkta kota aşılabiliyordu.

**Çözüm:** `connection.withTransaction()` ile atomik akış + compensation:

```
POST /lotteries/:id/participate
  │
  ├─ Ön kontroller (fast-fail, transaction dışı)
  │   ├─ Çekiliş mevcut mu?
  │   ├─ Status ACTIVE mi?
  │   └─ Süre dolmuş mu?
  │
  ├─ holdFunds() — gRPC (transaction dışı — Mongo TX'e dahil edilemez)
  │   └─ Başarısız → 400 error
  │
  ├─ mongoSession.withTransaction()
  │   ├─ countTickets(userId, session) — kişi limiti kontrolü
  │   ├─ countTickets(session) — toplam kota kontrolü
  │   ├─ generateUniqueNumbers(session) × quantity
  │   └─ createTicket(session) × quantity
  │   └─ Commit başarısız → ABORT
  │
  ├─ ABORT durumunda: releaseFunds(holdId) — compensation (telafi)
  │
  └─ auditLog.log()
```

**Değiştirilen Dosyalar:**

| Dosya | Değişiklik |
|-------|-----------|
| `lottery.repository.interface.ts` | `findById`, `createTicket`, `countTickets`, `findTicketWithNumbers` — `session?` parametresi |
| `mongo-lottery.repository.ts` | Session parametresi Mongoose sorgularına iletildi |
| `lottery.controller.ts` | `@InjectConnection` + `withTransaction` sarmalama + compensation |

---

## 10. Test Coverage

### 10.1 Mevcut Durum
- **Backend spec dosyaları:** 4 (önceden 2 idi)
- **Toplam test case:** ~12

### 10.2 Yeni Eklenen Test Dosyaları ⭐ YENİ

| Dosya | Case Sayısı | Kapsam |
|-------|------------|--------|
| `place-bid.handler.spec.ts` | 4 | Başarılı teklif, auction yok, katılım yok, yetersiz bakiye |
| `accept-trade-offer.handler.spec.ts` | 3 | Çift teminat, teklif yok, alıcı hatasında compensation |

### 10.3 Kalan Test Açıkları
- Auth modülü (login, token refresh)
- Lottery participate (atomic transaction testi)
- Commerce checkout (escrow akışı)
- Barter surplus CRUD

---

## 11. DI (Dependency Injection) Düzeltmeleri ⭐ YENİ

Runtime'da tespit edilen modül bağımlılık hataları:

| Modül | Eksik Import | Düzeltme |
|-------|-------------|---------|
| `VendorModule` | `FinancialGatewayModule` | `EarlyPaymentService` için eklendi |
| `MarketingModule` | `FinancialGatewayModule` | `GiftCardAdminController` için eklendi |
| `AuditMongooseModule` | `IStorageAdapter` | `LogsAdminController`'dan bağımlılık kaldırıldı, `minioClient.presignedGetObject()` doğrudan kullanıldı |

---

## 12. Açık Kalan Riskler & Planlananlar

### Kritik (Production Öncesi Zorunlu)

| # | Başlık | Risk | Durum |
|---|--------|------|-------|
| 1 | Iyzico Ödeme Entegrasyonu | `payment.controller.ts` stub döndürüyor — ödeme çalışmıyor | 🔴 Açık |
| 2 | MongoDB Replica Set kurulumu | Transaction'lar standalone'da çalışmaz | 🔴 Zorunlu |
| 3 | SSL sertifikası | `nginx/ssl/bazarx.crt` gerçek sertifika olmalı | 🔴 Zorunlu |
| 4 | Sentry DSN set edilmesi | `SENTRY_DSN` env boşsa production'da hata izleme yok | ⚠️ Yüksek |

### Yüksek Öncelikli

| # | Başlık | Durum |
|---|--------|-------|
| 5 | MongoDB automated backup (cron + S3) | 🟡 Planlandı |
| 6 | `AuctionCloseScheduler` → `@Cron` + distributed lock (multi-pod) | 🟡 Planlandı |
| 7 | Redis cache genişletme (ürün listesi, arama) | 🟡 Planlandı |
| 8 | Prometheus `/metrics` için iç ağ erişim kısıtı (JWT'siz) | 🟡 Planlandı |

### Orta Öncelikli

| # | Başlık | Durum |
|---|--------|-------|
| 9 | Test coverage kritik modüller için %20'ye çıkarılması | 🟢 Devam ediyor |
| 10 | Catalog `any` tip zincirleri temizliği | 🟢 Devam ediyor |
| 11 | Loki + Promtail bağlantı doğrulaması | 🟢 Planlandı |

---

## 13. Acil Durum Eylem Planı (Rollback & DR)

- **MongoDB Backup:** Her 24 saatte bir `mongodump` → S3 (otomatize edilmeli)
- **Rollback:** Backward compatible migration stratejisi ("Expand and Contract")
- **Docker Prod Başlatma:** `docker compose -f docker-compose.prod.yml up -d`
- **Health Check:** `curl https://bazarx.info/api/v1/health`
- **Metrics:** `GET /api/v1/metrics` (ADMIN JWT)
