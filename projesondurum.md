# BazarX Proje Son Durum — 2026-05-20

## Genel Bakış

BazarX; TicariTakas (B2B Barter), BazarX (Marketplace), BarterBorsa ve Pazar olmak üzere dört ana modülden oluşan çok platformlu bir ticaret ekosistemidir.

---

## Tamamlanan Geliştirmeler

### 1. Tier Yönetim Sistemi (Uçtan Uca)

#### Mimari — 3 Ayrı Tier Sistemi
| Sistem | Değerler | Koleksiyon | Amaç |
|---|---|---|---|
| VendorTier | CORE / PRIME / ELITE / APEX | `tier_benefits` | B2B TicariTakas komisyon/limit |
| LoyaltyTier | BRONZE → DIAMOND | `membership_tiers` | XP tabanlı sadakat |
| SubscriptionTier | BRONZE_P1 → DIAMOND_P2 | `user_subscriptions` | B2C ücretli abonelik |

#### Backend Endpointler
| Endpoint | Açıklama |
|---|---|
| `GET /admin/tiers` | B2B tier konfigürasyonlarını listele |
| `POST /admin/tiers` | Tier konfigürasyonu oluştur/güncelle |
| `DELETE /admin/tiers/cache` | Redis önbelleği temizle |
| `GET /admin/users/loyalty` | Kullanıcı XP + loyalty tier listesi |
| `PATCH /admin/users/:id/xp` | Manuel XP ekleme |
| `GET/POST/PUT /admin/loyalty/distribution-rules` | XP dağıtım kuralları CRUD |
| `POST/PUT /admin/loyalty/spending-rules` | Harcama limiti CRUD |

#### Admin Sayfaları
| Sayfa | URL |
|---|---|
| Tier Konfigürasyonu | `/admin/tier-management` |
| Satıcı Tier Atama | `/admin/vendor-tiers` |
| Kullanıcı Loyalty & XP | `/admin/user-loyalty` |
| Loyalty Sistem Ayarları | `/admin/loyalty` (3 sekme) |
| Tier Bilgi + Yükseltme | `/tier-info` |

#### Seed Dosyaları
```bash
npx tsx belge/seed/seed-tier-benefits-mongo.js     # 4 B2B tier konfigürasyonu
npx tsx belge/seed/seed-user-loyalty-tiers-mongo.js # 5 loyalty tier + user_level kayıtları
```

---

### 2. Ürün Görünürlük Sistemi

#### Backend — `ListCatalogListingsHandler` Güncellemeleri
- `isFeatured`, `isFlashSale`, `isSpecialOffer`, `isActive` MongoDB filtreleri ✅
- `categoryId` filtresi — CatalogProduct.categoryId üzerinden listing filtreleme ✅
- `city` filtresi — VendorProfile.city join ✅
- Varsayılan sıralama: isFeatured ürünler önce ✅
- Response'a 4 flag + city alanı eklendi ✅

#### Frontend
- `AdminProductFilter.vue` — Şehir + ✨⚡🔥 checkbox filtreleri ✅
- `AdminProductTable.vue` — Badge kolonu ✅
- `useAdminProducts.ts` — 4 yeni filtre state ✅

---

### 3. Ana Sayfa Ürün Bölümleri

| Bileşen | Eski Endpoint | Yeni Endpoint |
|---|---|---|
| `HomeFlashSales` | `/api/products` (yok) | `/api/v1/listings/marketplace?isFlashSale=true` |
| `HomeSpecialOffers` | `/api/products` (yok) | `/api/v1/listings/marketplace?isSpecialOffer=true` |
| `HomePersonalizedProducts` | `/api/products` (yok) | `/api/v1/listings/marketplace?isFeatured=true` |
| `HomeCategoryHighlights` | `/api/products/homepage-bulk` (yok) | Kategori başına `/marketplace?categoryId=X` |

---

### 4. API Rate Limiting — Tier Bazlı ✅

**Dosyalar:**
- `src/infrastructure/rate-limit/tier-rate-limit.guard.ts`
- `src/infrastructure/rate-limit/tier-rate-limit.module.ts`
- `src/infrastructure/rate-limit/skip-tier-rate-limit.decorator.ts`

**Akış:**
```
İstek → JwtAuthGuard → TierRateLimitGuard → Controller
```

**Tier Limitleri (tier_benefits.apiRatePerMin):**
| Tier | Limit |
|---|---|
| CORE | 60 istek/dk |
| PRIME | 120 istek/dk |
| ELITE | 300 istek/dk |
| APEX | 1000 istek/dk |

**Bypass Kuralları:**
- `@SkipTierRateLimit()` dekoratörü ile endpoint seviyesinde
- ADMIN / SUPER_ADMIN — otomatik bypass
- Giriş yapmamış kullanıcılar — otomatik bypass

**429 Response:**
```json
{
  "statusCode": 429,
  "message": "CORE tier için dakikalık API limiti (60 istek) aşıldı.",
  "tier": "CORE",
  "limit": 60,
  "resetAt": "2026-05-20T15:43:00.000Z"
}
```

---

## Açık Konular — Tümü Tamamlandı ✅

| Konu | Durum |
|---|---|
| `HomeCategoryHighlights` categoryId filtresi | ✅ |
| `VendorProfile.city` alanı | ✅ Zaten vardı |
| Vendor tier yükseltme UI | ✅ `/tier-info` CTA + modal |
| `resetCache` Redis entegrasyonu | ✅ CACHE_MANAGER flush |
| API rate limit middleware | ✅ TierRateLimitGuard |

---

## Mevcut Sistem Durumu

### Veritabanı (MongoDB)
| Koleksiyon | İçerik |
|---|---|
| `tier_benefits` | 4 B2B tier konfigürasyonu (CORE/PRIME/ELITE/APEX) |
| `membership_tiers` | 5 loyalty tier tanımı (0/1K/5K/15K/50K XP) |
| `user_levels` | Tüm kullanıcılar için XP kayıtları |
| `listings` | isFeatured/isFlashSale/isSpecialOffer/isActive flag'leri aktif |
| `xp_distribution_rules` | XP dağıtım kuralları |
| `xp_spending_limit_rules` | Tier bazlı harcama limitleri |

### Servisler
| Servis | Port | Durum |
|---|---|---|
| Backend (NestJS) | 3001 | ✅ |
| Frontend (Nuxt 3) | 3002 | ✅ |
| Financial Service | 3004 | ✅ |
| MongoDB | 27017 | ✅ |
| Redis | 6380 | ✅ |
| MinIO | 9000/9001 | ✅ |
| RabbitMQ | 5672 | ✅ |

---

## Sonraki Sprint

| Konu | Öncelik |
|---|---|
| Excel batch upload limit (tier_benefits.excelBatchLimit zorlama) | ✅ TAMAMLANDI |
| B2C subscription ödeme entegrasyonu (Iyzico) | YÜKSEK |
| TrustScore algoritması cron job implementasyonu | ORTA |
| SwapSession timeout cron job (her gece 02:00) | YÜKSEK |
| BarterBorsa batch matching engine | YÜKSEK |

---

## Tamamlanan Geliştirmeler — 2026-05-20 Güncelleme

### 5. Excel Batch Upload Limit Zorlama ✅

**Dosyalar:**
- `apps/backend/src/modules/vendor/presentation/vendor-product.controller.ts`
- `apps/backend/src/modules/vendor/vendor.module.ts`

**Akış:**
```
bulkImport → tier_benefits.excelBatchLimit sorgula → rows > limit → 400 BadRequestException
```

**Detay:**
- Vendor'ın `vendor.tier` değerine göre `TierBenefit` dokümanından `excelBatchLimit` çekiliyor
- Varsayılan limit: 50 satır (CORE paketi için)
- Aşım durumunda Türkçe hata mesajı + paket yükseltme önerisi dönüyor
- Admin panelden her tier için ayrı limit tanımlanabilir (CORE: 50, PRIME: 100, ELITE: 200, APEX: 500)

---

## Çalıştırma

```bash
# Tüm servisler
pnpm dev

# Seed (ilk kurulum)
npx tsx belge/seed/seed-all-mongo.js
```

---

*Son güncelleme: 2026-05-20 16:47 | Branch: main | Commit: (typescript fix + excelBatchLimit enforcement)*
