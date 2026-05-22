---
title: "BazarX Monorepo Kod Yapısı — bazarxmongo"
type: summary
tags: [code, monorepo, nestjs, nuxt, backend, frontend, mobile]
created: 2026-05-21
updated: 2026-05-21
source: raw/datasets/bazarxmongo/
---

# BazarX Monorepo Kod Yapısı — bazarxmongo

**Kaynak:** `/Users/macbook/Desktop/belgeler/bazarxopsidian/raw/datasets/bazarxmongo/`

## Kod İstatistikleri

| Katman | Dosya Sayısı | Açıklama |
|---|---|---|
| Backend source | 920 `.ts` | Modüller + altyapı |
| Frontend source | 805 `.ts/.vue` | Sayfalar, bileşenler, composables |
| Packages | 391 `.ts` | Shared library'ler |
| **Toplam** | **~2.116** | |

## Monorepo Yapısı

```
barterborsa-monorepo (pnpm workspaces + Turborepo)
├── apps/
│   ├── backend/           NestJS, port 3001 (920 .ts dosyası)
│   ├── frontend/          Nuxt 3 SPA, port 3002 (805 .ts/.vue dosyası)
│   ├── financial-service/ gRPC microservice, port 50051
│   ├── delivery-service/  Ayrı servis, port 3003
│   └── mobile/            React Native (Expo)
├── packages/              391 .ts dosyası
│   ├── domain-identity/   User/Auth domain logic (shared)
│   └── shared/
│       ├── shared-core/        Result<T>, Entity base, Value Object base
│       ├── shared-types/       DTO tipleri (frontend+backend ortak)
│       ├── shared-security/     JwtAuthGuard, RolesGuard
│       ├── shared-persistence/  MongooseService, base repository
│       ├── shared-messaging/    RabbitMQ modülü
│       ├── shared-queue/        BullMQ tanımları
│       ├── shared-nest/         Dekoratörler (@CurrentUser, @Roles)
│       └── shared-observability/ Health check, logger
└── infra/  docker-compose, nginx
```

## Backend Modülleri (`apps/backend/src/modules/`) — 22 modül

Her modül DDD yapısında: `application/`, `domain/`, `infrastructure/`, `presentation/` alt dizinleri.

| Modül | Katmanlar | Açıklama |
|---|---|---|
| `identity` | ✓ | Kullanıcı, auth, JWT, Google OAuth |
| `catalog` | ✓ | Ürün katalog, kategori, filtreleme |
| `commerce` | ✓ | Sipariş, sepet, ödeme |
| `vendor` | ✓ | Satıcı yönetimi, onay, puanlama |
| `barter` | ✓ | B2B TicariTakas, SurplusItem, TradeOffer, SwapSession |
| `barterborsa` | ✓ | Kurumsal ekosistemi, fabrika-bayi, kör havuz |
| `auction` | ✓ | Açık artırma sistemi |
| `advertising` | ✓ | Reklam modülü |
| `loyalty` | ✓ | XP ekonomisi, tier sistemi |
| `subscription` | ✓ | B2C abonelik, tier management |
| `menu` | ✓ | BazarX GO menü sistemi, QR üretimi |
| `delivery` | ✓ | Teslimat yönetimi |
| `financial-gateway` | ✓ | Cüzdan, escrow, ödeme geçidi |
| `communication` | ✓ | Bildirimler, e-posta, SMS |
| `content` | ✓ | İçerik yönetimi |
| `analytics` | ✓ | Raporlama, istatistikler |
| `inventory` | ✓ | Stok yönetimi |
| `media` | ✓ | Dosya yükleme, medya |
| `marketing` | ✓ | Pazarlama araçları |
| `audit` | ✓ | Denetim logları |
| `tax` | ✓ | Vergi hesaplama |
| `garage-sale` | ✓ | Garaj satışı modülü |

## Frontend Yapısı (`apps/frontend/`) — 194 sayfa, 396 bileşen

```
frontend/
├── components/      396 Vue bileşeni (40+ alt klasör)
│   ├── admin/        Yönetim paneli bileşenleri
│   ├── auction/      Açık artırma bileşenleri
│   ├── barter/       B2B takas bileşenleri
│   ├── vendor/       Satıcı bileşenleri
│   ├── loyalty/      XP/tier bileşenleri
│   ├── payment/      Ödeme bileşenleri
│   ├── product/      Ürün bileşenleri
│   ├── ticaritakas/  B2B TicariTakas bileşenleri
│   └── ...
├── pages/            194 Nuxt sayfası
│   ├── admin/        Yönetim paneli (/admin/products, /admin/users, ...)
│   ├── auth/         Giriş/Kayıt (/auth/login, /auth/register, ...)
│   ├── barter/      B2B TicariTakas (/barter/trade-pool, ...)
│   ├── barterborsa/ Kurumsal BarterBorsa (/barterborsa/ecosystem, ...)
│   ├── bazarx-go/   Restoran menü sistemi (/bazarx-go/menu, ...)
│   ├── vendor/       Satıcı dashboard (/vendor/dashboard, /vendor/products, ...)
│   ├── auction/      Açık artırma (/auctions, /auctions/[id], ...)
│   └── ...
├── composables/     Vue composables (API, form, state)
├── stores/          Pinia store'ları
├── services/api/    API servis katmanı
├── middleware/       Nuxt middleware
├── i18n/locales/    Çeviri dosyaları
└── assets/          CSS, görseller
```

## Package'ler (`packages/`)

### `domain-identity`
Kullanıcı ve auth domain logic'i. Uygulama katmanında authentication ve authorization kuralları.

### `shared/shared-core`
```typescript
Result<T>, Entity base class, Value Object base class
Tüm uygulamalarda ortak kullanılır.
```

### `shared/shared-types`
Frontend ve backend arasında paylaşılan DTO tipleri. API kontratları burada tanımlanır.

### `shared/shared-security`
```typescript
JwtAuthGuard    // JWT token doğrulama
RolesGuard      // Rol bazlı yetkilendirme
```

### `shared/shared-persistence`
```typescript
MongooseService     // MongoDB bağlantı servisi
BaseRepository      // Repository pattern base
```

### `shared/shared-messaging`
RabbitMQ entegrasyonu. Asenkron servisler arası iletişim.

### `shared/shared-queue`
BullMQ job tanımları. Background job processing.

### `shared/shared-nest`
```typescript
@CurrentUser     // Authenticated user inject
@Roles           // Role decorator
```

### `shared/shared-observability`
```typescript
StructuredLogger  // Pino tabanlı structured logging
Health check      // Servis sağlık kontrolü
// YENİ (2026-05-22):
// infrastructure/metrics/ — Prometheus prom-client (/api/v1/metrics)
// common/filters/sentry-exception.filter.ts — Sentry 5xx raporlama
```

## Tasarım Sistemi (DESIGN.md)

**MD3 + Premium Glassmorphism** yaklaşımı:
- **Primary Navy:** `#002444`
- **Accent Gold:** `#FFD814`
- **Success Green:** `#22c55e`
- **Surface:** `#f8f9fa`
- **Typography:** Outfit (headings), Inter (body)

## Önemli Kurallar (`.claude/rules/`)

| Dosya | İçerik |
|---|---|
| `style.md` | TypeScript strict, `any` yasak, StructuredLogger zorunlu |
| `surplus-rules.md` | B2B SurplusItem audit checklist |
| `barter-rules.md` | TicariTakas kuralları, komisyon, TrustScore |
| `barter-audit.md` | Barter sistem denetimi |
| `auction-audit.md` | Açık artırma sistemi denetimi |
| `ecosystem-audit.md` | Ekosistem bayi ağı denetimi |
| `lottery-audit.md` | Çekiliş sistemi denetimi |
| `financial-services-expert.md` | Cüzdan/Ledger mutabakat kuralları |
| `frontend-design.md` | AI-slop engelleme, modern tipografi |

## Teknoloji Stack Özeti

| Katman | Teknoloji |
|---|---|
| Backend | NestJS 10+ / Fastify |
| Veritabanı | **MongoDB + Mongoose** |
| Frontend | Nuxt 3 + Vue 3 + Pinia + Tailwind |
| Mobil | React Native (Expo) |
| Cache | Redis 7 |
| Queue | RabbitMQ + BullMQ |
| Auth | JWT + Google OAuth |
| Ödeme | Iyzico |
| Monitoring | Pino + Health checks + Prometheus + Sentry |

## İlgili Kavramlar

[[teknik-mimari]], [[komisyon-yapisi]], [[barter-takas]], [[trustscore]]

## Bu Kaynaktan Çıkarılan Kavramlar

- Monorepo organizasyonu — `packages/shared` ile domain/shared ayrımı
- DDD modüler yapı — her modül kendi controller/handler/entity'sini barındırır
- Mikroservis mimarisi — financial-service ayrı gRPC servisi olarak çalışır