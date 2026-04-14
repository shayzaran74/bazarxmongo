# Gemini Prompt — FAZ 1: Monorepo İskeleti + Shared Core

Aşağıdaki prompt'u Gemini'ye olduğu gibi yapıştır. Üç bölümden oluşuyor: System Prompt, Görev, Dosya Listesi.

---

## YAPIŞTIRILACAK PROMPT BAŞLANGIÇ

---

### SYSTEM PROMPT

```
Sen bir senior NestJS backend developer'sın. BarterBorsa adlı bir ticari takas platformunun backend'ini sıfırdan yazıyorsun.

MİMARİ KARARLAR (bunları ASLA sorgulamayacaksın, aynen uygulayacaksın):

- Framework: NestJS 10+ / Fastify adapter
- Monorepo: Turborepo + pnpm workspaces
- Package manager: pnpm
- TypeScript strict mode
- PostgreSQL 16 (core backend + financial service)
- MongoDB 7 (delivery service)
- Redis 7 (cache, session, rate limiting)
- RabbitMQ 3.13 (event bus)
- Auth: Google OAuth2 + JWT (access/refresh) + Redis session
- ORM: Prisma (PostgreSQL servisler), Mongoose (MongoDB servisler)
- Inter-service: gRPC (senkron), RabbitMQ (asenkron)
- DDD: Entity, AggregateRoot, ValueObject, UseCase, Repository pattern
- CQRS: NestJS CQRS modülü, Command/Query ayrımı
- Outbox pattern: event güvenilirliği için3-

KURALLAR:
1. Sadece istenen dosyaları yaz, fazladan dosya ekleme
2. Her dosyanın tam path'ini başına yaz (örn: // packages/shared/shared-core/src/domain/entity.base.ts)
3. Kendi mimari önerini ekleme
4. TypeScript strict mode uyumlu yaz
5. Monorepo package isimleri @barterborsa/ prefix'i ile olacak (örn: @barterborsa/shared-core)
6. Her dosyada gerekli import/export'lar eksiksiz olacak
7. index.ts barrel export dosyaları oluştur
8. Kod yorumlarını Türkçe yaz
```

### GÖREV

```
FAZ 1: Monorepo iskeletini ve temel shared paketleri oluştur.

Bu fazda şunları yazacaksın:

A) Monorepo kök konfigürasyonu (Turborepo + pnpm)
B) packages/shared/shared-core — DDD temel sınıfları
C) packages/shared/shared-persistence — Prisma ve Mongoose base repository'ler
D) packages/shared/shared-messaging — RabbitMQ event bus altyapısı
E) packages/shared/shared-observability — Logging ve health check
F) packages/shared/shared-security — JWT, Google OAuth strategy, guards
G) packages/shared/shared-nest — Decorators, interceptors, filters, pipes
H) apps/backend — Boş NestJS bootstrap (main.ts + app.module.ts)
I) infra/docker-compose.yml — PostgreSQL, MongoDB, Redis, RabbitMQ

Monorepo yapısı:

barterborsa/
├── apps/
│   ├── backend/                       # Ana NestJS servisi
│   ├── financial-service/             # (bu fazda sadece boş klasör)
│   └── delivery-service/              # (bu fazda sadece boş klasör)
├── packages/
│   ├── domains/                       # (bu fazda boş, sonraki fazlarda doldurulacak)
│   ├── shared/
│   │   ├── shared-core/
│   │   ├── shared-persistence/
│   │   ├── shared-messaging/
│   │   ├── shared-observability/
│   │   ├── shared-security/
│   │   └── shared-nest/
│   └── proto/                         # (bu fazda boş)
├── infra/
│   ├── docker-compose.yml
│   └── scripts/
│       └── init-databases.sql
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .gitignore
└── .env.example
```

### DOSYA LİSTESİ VE İÇERİKLERİ

Aşağıdaki dosyaların HER BİRİNİN tam içeriğini yaz. Dosya atlamayacaksın.

```
DOSYA #1: pnpm-workspace.yaml
- packages/shared/* ve apps/* workspace olarak tanımla
- packages/domains/* ve packages/proto da dahil et

DOSYA #2: package.json (root)
- private: true
- packageManager: pnpm
- scripts: dev, build, lint, test, docker:up, docker:down
- devDependencies: turbo, typescript, prettier, eslint

DOSYA #3: turbo.json
- pipeline: build, dev, lint, test, db:generate, db:migrate
- build dependsOn: ^build
- dev: cache false, persistent true

DOSYA #4: tsconfig.base.json
- strict: true
- target: ES2022
- module: commonjs
- paths alias: @barterborsa/* → packages/*/src

DOSYA #5: .gitignore
- node_modules, dist, .env, .turbo
- *.js, *.d.ts, *.js.map (packages altında — derleme çıktıları)
- NOT: .ts dosyalarını ignore etme

DOSYA #6: .env.example
- PG_PASSWORD, MONGO_PASSWORD, REDIS_PASSWORD, RMQ_PASSWORD
- DATABASE_URL, FINANCIAL_DATABASE_URL, MONGODB_URI, REDIS_URL, RABBITMQ_URL
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
- JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES_IN=15m, JWT_REFRESH_EXPIRES_IN=7d
- IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_BASE_URL
- OTEL_EXPORTER_OTLP_ENDPOINT
- NODE_ENV, BACKEND_PORT=3001, FINANCIAL_PORT=3004, DELIVERY_PORT=3005
- FINANCIAL_GRPC_URL, DELIVERY_GRPC_URL

---

DOSYA #7: packages/shared/shared-core/package.json
- name: @barterborsa/shared-core
- main: src/index.ts
- dependencies: uuid

DOSYA #8: packages/shared/shared-core/tsconfig.json
- extends: ../../../tsconfig.base.json

DOSYA #9: packages/shared/shared-core/src/index.ts
- Tüm alt modüllerin barrel export'u

DOSYA #10: packages/shared/shared-core/src/domain/entity.base.ts
- Abstract Entity<T> sınıfı
- Props: id (string, uuid), createdAt, updatedAt, version (optimistic locking)
- equals() metodu (id bazlı)

DOSYA #11: packages/shared/shared-core/src/domain/aggregate-root.base.ts
- Entity'den türetilmiş
- private _domainEvents: DomainEvent[] dizisi
- addDomainEvent(), clearDomainEvents(), getDomainEvents() metodları

DOSYA #12: packages/shared/shared-core/src/domain/value-object.base.ts
- Abstract ValueObject<T> sınıfı
- equals() metodu (deep comparison)
- Immutable — readonly props

DOSYA #13: packages/shared/shared-core/src/domain/domain-event.base.ts
- Abstract DomainEvent sınıfı
- Props: eventId (uuid), occurredAt (Date), aggregateId (string)
- eventName: abstract string getter

DOSYA #14: packages/shared/shared-core/src/domain/repository.interface.ts
- Generic IRepository<T extends AggregateRoot> interface
- Metodlar: findById, findAll, save, delete
- IReadRepository ve IWriteRepository olarak da ayrılmış (CQRS uyumlu)

DOSYA #15: packages/shared/shared-core/src/application/use-case.interface.ts
- IUseCase<TInput, TOutput> interface
- Tek metod: execute(input: TInput): Promise<TOutput>

DOSYA #16: packages/shared/shared-core/src/application/command.base.ts
- Abstract Command sınıfı
- Props: commandId (uuid), timestamp (Date)

DOSYA #17: packages/shared/shared-core/src/application/query.base.ts
- Abstract Query sınıfı

DOSYA #18: packages/shared/shared-core/src/application/pagination.dto.ts
- PaginationInput: page, limit, sortBy?, sortOrder?
- PaginatedResult<T>: items, total, page, limit, totalPages

DOSYA #19: packages/shared/shared-core/src/exceptions/domain.exception.ts
- DomainException extends Error
- Props: code (string), statusCode (number)

DOSYA #20: packages/shared/shared-core/src/exceptions/not-found.exception.ts
- NotFoundException extends DomainException

DOSYA #21: packages/shared/shared-core/src/exceptions/conflict.exception.ts
- ConflictException extends DomainException

DOSYA #22: packages/shared/shared-core/src/types/result.type.ts
- Result<T, E = Error> type
- Ok<T> ve Err<E> helper fonksiyonları
- isOk() ve isErr() type guard'ları

DOSYA #23: packages/shared/shared-core/src/types/optional.type.ts
- Optional<T> = T | null | undefined

---

DOSYA #24: packages/shared/shared-persistence/package.json
- name: @barterborsa/shared-persistence
- dependencies: @nestjs/common, @prisma/client, prisma, mongoose, @nestjs/mongoose

DOSYA #25: packages/shared/shared-persistence/tsconfig.json

DOSYA #26: packages/shared/shared-persistence/src/index.ts

DOSYA #27: packages/shared/shared-persistence/src/prisma/prisma.module.ts
- Global NestJS module
- PrismaService provider

DOSYA #28: packages/shared/shared-persistence/src/prisma/prisma.service.ts
- PrismaClient extend
- onModuleInit: $connect
- onModuleDestroy: $disconnect
- enableShutdownHooks

DOSYA #29: packages/shared/shared-persistence/src/prisma/base-prisma.repository.ts
- Abstract BasePrismaRepository<T>
- Generic CRUD: findById, findMany, create, update, delete
- Transaction desteği (prisma.$transaction)

DOSYA #30: packages/shared/shared-persistence/src/prisma/prisma-unit-of-work.ts
- UnitOfWork pattern — birden fazla repository'yi tek transaction'da çalıştır

DOSYA #31: packages/shared/shared-persistence/src/mongoose/mongoose.module.ts
- Global NestJS module — MongooseModule.forRootAsync

DOSYA #32: packages/shared/shared-persistence/src/mongoose/base-mongo.repository.ts
- Abstract BaseMongoRepository<T>
- Generic CRUD: findById, findMany, create, update, delete
- Mongoose Model injection

DOSYA #33: packages/shared/shared-persistence/src/mongoose/mongoose-unit-of-work.ts
- MongoDB transaction desteği (session-based)

DOSYA #34: packages/shared/shared-persistence/src/outbox/outbox.module.ts
DOSYA #35: packages/shared/shared-persistence/src/outbox/outbox.entity.ts
- Props: id, eventType, payload (JSON), status (PENDING|PUBLISHED|FAILED), createdAt, publishedAt, retryCount
DOSYA #36: packages/shared/shared-persistence/src/outbox/outbox-publisher.service.ts
- Polling interval ile PENDING event'leri al, RabbitMQ'ya publish et, PUBLISHED olarak işaretle
DOSYA #37: packages/shared/shared-persistence/src/outbox/outbox.repository.ts

---

DOSYA #38: packages/shared/shared-messaging/package.json
- name: @barterborsa/shared-messaging
- dependencies: amqplib, @golevelup/nestjs-rabbitmq

DOSYA #39: packages/shared/shared-messaging/tsconfig.json
DOSYA #40: packages/shared/shared-messaging/src/index.ts

DOSYA #41: packages/shared/shared-messaging/src/rabbitmq/rabbitmq.module.ts
- RabbitMQModule.forRootAsync ile konfigürasyon
- Exchange tanımları

DOSYA #42: packages/shared/shared-messaging/src/rabbitmq/rabbitmq.service.ts
- Publish metodu — exchange + routing key ile mesaj gönder

DOSYA #43: packages/shared/shared-messaging/src/rabbitmq/publisher.service.ts
- Type-safe event publishing
- Outbox pattern entegrasyonu

DOSYA #44: packages/shared/shared-messaging/src/rabbitmq/consumer.service.ts
- Queue listener base class
- Error handling ve retry logic (dead letter queue)

DOSYA #45: packages/shared/shared-messaging/src/events/integration-event.base.ts
- IntegrationEvent abstract sınıfı
- Props: eventId, eventType, occurredAt, correlationId, causationId, payload

DOSYA #46: packages/shared/shared-messaging/src/events/event-bus.interface.ts
- IEventBus interface: publish, subscribe

DOSYA #47: packages/shared/shared-messaging/src/events/event-metadata.ts
- EventMetadata value object: correlationId, causationId, userId, timestamp

DOSYA #48: packages/shared/shared-messaging/src/exchanges/identity.exchange.ts
- IDENTITY_EXCHANGE = 'identity.events'
- Routing keys: user.registered, user.updated, user.deleted

DOSYA #49: packages/shared/shared-messaging/src/exchanges/commerce.exchange.ts
- COMMERCE_EXCHANGE = 'commerce.events'
- Routing keys: order.created, order.completed, order.cancelled

DOSYA #50: packages/shared/shared-messaging/src/exchanges/financial.exchange.ts
- FINANCIAL_EXCHANGE = 'financial.events'
- Routing keys: payment.completed, payment.failed, wallet.topup, commission.calculated

DOSYA #51: packages/shared/shared-messaging/src/exchanges/delivery.exchange.ts
- DELIVERY_EXCHANGE = 'delivery.events'
- Routing keys: shipment.created, shipment.shipped, shipment.delivered

---

DOSYA #52: packages/shared/shared-observability/package.json
- name: @barterborsa/shared-observability
- dependencies: @nestjs/terminus, pino, pino-pretty, nestjs-pino

DOSYA #53: packages/shared/shared-observability/tsconfig.json
DOSYA #54: packages/shared/shared-observability/src/index.ts

DOSYA #55: packages/shared/shared-observability/src/logging/logger.module.ts
- Pino logger — JSON structured logging
- correlationId otomatik enjeksiyonu

DOSYA #56: packages/shared/shared-observability/src/logging/structured-logger.ts
- Custom logger service: info, warn, error, debug
- Her log'da: timestamp, correlationId, service name, level

DOSYA #57: packages/shared/shared-observability/src/logging/correlation-id.middleware.ts
- Gelen request'ten x-correlation-id header'ını oku veya yeni üret
- AsyncLocalStorage ile tüm request boyunca taşı

DOSYA #58: packages/shared/shared-observability/src/health/health.module.ts
DOSYA #59: packages/shared/shared-observability/src/health/health.controller.ts
- GET /health → liveness check
- GET /ready → readiness check (DB, Redis, RabbitMQ bağlantıları)

---

DOSYA #60: packages/shared/shared-security/package.json
- name: @barterborsa/shared-security
- dependencies: @nestjs/jwt, @nestjs/passport, passport, passport-google-oauth20, passport-jwt, bcrypt, ioredis

DOSYA #61: packages/shared/shared-security/tsconfig.json
DOSYA #62: packages/shared/shared-security/src/index.ts

DOSYA #63: packages/shared/shared-security/src/auth/jwt.module.ts
- JwtModule.registerAsync — access ve refresh token config

DOSYA #64: packages/shared/shared-security/src/auth/jwt.strategy.ts
- Passport JWT strategy
- Token'dan user bilgisi çıkar
- Redis blacklist kontrolü

DOSYA #65: packages/shared/shared-security/src/auth/google-oauth.strategy.ts
- Passport Google OAuth2 strategy
- Profile'dan email, name, picture çıkar

DOSYA #66: packages/shared/shared-security/src/auth/auth.guard.ts
- JWT doğrulama guard'ı
- Public route desteği (@Public() decorator ile)

DOSYA #67: packages/shared/shared-security/src/auth/roles.guard.ts
- Role-based access control
- @Roles('admin', 'vendor') decorator ile çalışır

DOSYA #68: packages/shared/shared-security/src/rate-limiting/rate-limit.module.ts
DOSYA #69: packages/shared/shared-security/src/rate-limiting/rate-limit.guard.ts
- Redis-backed sliding window rate limiter
- Konfigüre edilebilir: max requests, window size

DOSYA #70: packages/shared/shared-security/src/encryption/encryption.service.ts
- AES-256-GCM ile hassas veri şifreleme/çözme
- Key rotation desteği

DOSYA #71: packages/shared/shared-security/src/encryption/hashing.service.ts
- bcrypt ile password hashing
- compare metodu

---

DOSYA #72: packages/shared/shared-nest/package.json
- name: @barterborsa/shared-nest

DOSYA #73: packages/shared/shared-nest/tsconfig.json
DOSYA #74: packages/shared/shared-nest/src/index.ts

DOSYA #75: packages/shared/shared-nest/src/decorators/current-user.decorator.ts
- @CurrentUser() — request'ten authenticated user'ı çıkarır

DOSYA #76: packages/shared/shared-nest/src/decorators/roles.decorator.ts
- @Roles(...roles) — gerekli rolleri metadata olarak set eder

DOSYA #77: packages/shared/shared-nest/src/decorators/public.decorator.ts
- @Public() — auth guard'ını bypass eder

DOSYA #78: packages/shared/shared-nest/src/decorators/idempotent.decorator.ts
- @Idempotent() — idempotency key zorunlu kılar

DOSYA #79: packages/shared/shared-nest/src/decorators/api-response.decorator.ts
- @ApiStandardResponse() — Swagger response formatı

DOSYA #80: packages/shared/shared-nest/src/interceptors/response-transform.interceptor.ts
- Tüm response'ları standart format: { success, data, meta, timestamp }

DOSYA #81: packages/shared/shared-nest/src/interceptors/timeout.interceptor.ts
- Konfigüre edilebilir timeout (default 30s)

DOSYA #82: packages/shared/shared-nest/src/interceptors/cache.interceptor.ts
- Redis-backed response cache
- TTL ve cache key konfigürasyonu

DOSYA #83: packages/shared/shared-nest/src/filters/global-exception.filter.ts
- Tüm hataları yakala, standart error response formatı
- DomainException, HttpException, unknown error ayrımı
- Structured logging ile hata kaydı

DOSYA #84: packages/shared/shared-nest/src/filters/domain-exception.filter.ts
- DomainException'ları HTTP response'a dönüştür

DOSYA #85: packages/shared/shared-nest/src/filters/validation.filter.ts
- class-validator hatalarını okunabilir formata çevir

DOSYA #86: packages/shared/shared-nest/src/pipes/validation.pipe.ts
- Global validation pipe — whitelist, forbidNonWhitelisted, transform

DOSYA #87: packages/shared/shared-nest/src/pipes/parse-pagination.pipe.ts
- Query params'tan PaginationInput oluştur

DOSYA #88: packages/shared/shared-nest/src/middleware/request-context.middleware.ts
- correlationId, requestId, userId enjekte et
- AsyncLocalStorage ile taşı

---

DOSYA #89: apps/backend/package.json
- name: @barterborsa/backend
- dependencies: @nestjs/core, @nestjs/platform-fastify, @nestjs/cqrs
- devDependencies: @nestjs/cli, @nestjs/testing
- workspace dependencies: @barterborsa/shared-core, shared-persistence, shared-messaging, shared-observability, shared-security, shared-nest

DOSYA #90: apps/backend/tsconfig.json

DOSYA #91: apps/backend/nest-cli.json

DOSYA #92: apps/backend/src/main.ts
- NestFactory.create ile FastifyAdapter
- Global pipes, filters, interceptors register
- Swagger setup
- Port: process.env.BACKEND_PORT || 3001
- Graceful shutdown

DOSYA #93: apps/backend/src/app.module.ts
- Import: PrismaModule, RabbitMQModule, LoggerModule, HealthModule
- Global guards: AuthGuard, RateLimitGuard
- Config module: forRoot ile .env yükleme

DOSYA #94: apps/backend/src/app-components.ts
- Module grupları tanımı:
  CORE: [IdentityModule] (henüz boş, sonraki fazda doldurulacak)
  MARKET: [] (sonraki fazlarda)
  EXCHANGE: [] (sonraki fazlarda)
  SUPPORT: [] (sonraki fazlarda)

DOSYA #95: apps/backend/src/config/app.config.ts
- registerAs('app') — port, environment, name

DOSYA #96: apps/backend/src/config/database.config.ts
- registerAs('database') — DATABASE_URL

DOSYA #97: apps/backend/src/config/auth.config.ts
- registerAs('auth') — JWT secrets, Google OAuth credentials

DOSYA #98: apps/backend/src/config/redis.config.ts
- registerAs('redis') — REDIS_URL

DOSYA #99: apps/backend/src/config/rabbitmq.config.ts
- registerAs('rabbitmq') — RABBITMQ_URL

---

DOSYA #100: infra/docker-compose.yml
- Services: postgresql (16-alpine), mongodb (7), redis (7-alpine), rabbitmq (3.13-management-alpine)
- Her servis için: healthcheck, volume, port mapping
- PostgreSQL environment: POSTGRES_USER=barterborsa
- MongoDB environment: MONGO_INITDB_ROOT_USERNAME=barterborsa
- Redis: requirepass ile şifre
- RabbitMQ: default user/pass
- Volumes: pg_data, mongo_data, redis_data, rmq_data

DOSYA #101: infra/scripts/init-databases.sql
- CREATE DATABASE barterborsa_core;
- CREATE DATABASE barterborsa_financial;
- GRANT ALL PRIVILEGES
```

### KONTROL

Tüm dosyaları yazdıktan sonra şunları kontrol et:
1. Her dosyanın başında tam path var mı?
2. Tüm import path'leri @barterborsa/* workspace alias'ını kullanıyor mu?
3. index.ts barrel export'ları tüm public API'ları dışarı veriyor mu?
4. TypeScript strict mode'da hata vermeyecek mi?
5. Eksik dependency var mı package.json'larda?

Sorun varsa düzelt ve açıkla.

---

## YAPIŞTIRILACAK PROMPT BİTİŞ