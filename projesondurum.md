# BazarX Proje Son Durum — 2026-05-20

## Genel Bakış

BazarX; TicariTakas (B2B Barter), BazarX (Marketplace), BarterBorsa ve Pazar olmak üzere dört ana modülden oluşan çok platformlu bir ticaret ekosistemidir.

---

## Tamamlanan Geliştirmeler (Bu Oturum)

### 1. Tier Yönetim Sistemi (Uçtan Uca)

#### Mimari
- **3 ayrı tier sistemi** netleştirildi:
  - `VendorTier` → B2B TicariTakas (CORE / PRIME / ELITE / APEX)
  - `LoyaltyTier` → XP tabanlı sadakat (BRONZE → DIAMOND)
  - `SubscriptionTier` → B2C abonelik (BRONZE_P1 → DIAMOND_P2)

#### Schema Değişiklikleri
- `tierBenefit.schema.ts` — `tier: B2BTierType` alanı + unique index eklendi
- `xpSpendingLimitRule.schema.ts` — `tier` alanı eklendi, field aliaslar temizlendi
- `shared-persistence/index.ts` — `TierBenefitSchema`, `ITierBenefit`, `B2BTierValues` export edildi

#### Backend — Yeni Endpointler
| Endpoint | Açıklama |
|---|---|
| `GET /admin/tiers` | B2B tier konfigürasyonlarını listele |
| `POST /admin/tiers` | Tier konfigürasyonu oluştur/güncelle (upsert) |
| `DELETE /admin/tiers/cache` | Tier önbelleğini temizle |
| `GET /admin/users/loyalty` | Kullanıcı XP + loyalty tier listesi |
| `PATCH /admin/users/:id/xp` | Manuel XP ekleme |
| `GET /admin/loyalty/distribution-rules` | XP dağıtım kurallarını listele |
| `POST /admin/loyalty/distribution-rules` | Kural oluştur |
| `PUT /admin/loyalty/distribution-rules/:id` | Kural güncelle |
| `POST /admin/loyalty/spending-rules` | Harcama limiti oluştur |
| `PUT /admin/loyalty/spending-rules/:id` | Harcama limiti güncelle |

#### Frontend — Yeni Admin Sayfaları
| Sayfa | URL | İçerik |
|---|---|---|
| Tier Konfigürasyonu | `/admin/tier-management` | CORE/PRIME/ELITE/APEX parametrelerini düzenle |
| Satıcı Tier Atama | `/admin/vendor-tiers` | Vendor'lara tier ata, filtrele, inline değiştir |
| Kullanıcı Loyalty | `/admin/user-loyalty` | XP/tier görüntüle, manuel XP ekle |
| Loyalty Ayarları | `/admin/loyalty` | 3 sekme: Genel / Dağıtım Kuralları / Harcama Limitleri |
| Tier Bilgi | `/tier-info` | Vendor'a özel tier karşılaştırma + XP progress |

#### Seed Dosyaları
- `seed-tier-benefits-mongo.js` — 4 B2B tier konfigürasyonu (tier_benefits koleksiyonu)
- `seed-user-loyalty-tiers-mongo.js` — 5 loyalty tier tanımı + tüm kullanıcılara başlangıç user_level kaydı

---

### 2. Ürün Görünürlük Sistemi (Featured / Flash / Special / isActive)

#### Backend
- `ListCatalogListingsQuery` — `city`, `isFeatured`, `isFlashSale`, `isSpecialOffer`, `isActive` filtre parametreleri
- `ListCatalogListingsHandler`:
  - `isActive: true` filtresi public sorgulara eklendi
  - Şehir filtresi → `VendorProfile.city` üzerinden vendor join
  - 4 flag MongoDB filter'a uygulandı
  - Varsayılan sıralama: isFeatured önce, sonra createdAt desc
  - Response'a `isFeatured`, `isFlashSale`, `isSpecialOffer`, `isActive`, `city` eklendi
- `ListingController` — `/marketplace` ve `/listings` endpoint'lerine yeni query param'lar
- `ListAdminProductsHandler` — 4 flag admin response'una dahil edildi

#### Frontend
- `AdminProductFilter.vue` — Şehir input + ✨ Featured / ⚡ Flash Sale / 🔥 Özel Fırsat checkbox filtreleri
- `AdminProductTable.vue` — "Etiketler" kolonu (badge'ler)
- `useAdminProducts.ts` — 4 yeni filtre state + API entegrasyonu
- `AdminBulkUpdateModal.vue` — Zaten çalışıyordu, dokunulmadı

---

### 3. Ana Sayfa Ürün Bölümleri

| Bileşen | Sorun | Çözüm |
|---|---|---|
| `HomeFlashSales.vue` | `/api/products` (yok) | `/api/v1/listings/marketplace?isFlashSale=true` |
| `HomeSpecialOffers.vue` | `/api/products` (yok) | `/api/v1/listings/marketplace?isSpecialOffer=true` |
| `HomePersonalizedProducts.vue` | `/api/products` (yok) + console.error | `/api/v1/listings/marketplace?isFeatured=true` + client sort |
| `HomeCategoryHighlights.vue` | `/api/products/homepage-bulk` (yok) | Listing'leri çekip category bazlı client gruplama |

---

## Mevcut Sistem Durumu

### Veritabanı (MongoDB)
- **Motor**: MongoDB 7 (Mongoose ODM)
- **Koleksiyonlar**: `listings`, `vendors`, `users`, `user_levels`, `membership_tiers`, `tier_benefits`, `xp_spending_limit_rules`, `xp_distribution_rules`, `tier_benefits`

### Backend (NestJS)
- **Port**: 3001 (REST) + 50051 (gRPC)
- **Mimari**: CQRS + DDD + Outbox Pattern
- **Auth**: JWT (Access + Refresh)

### Frontend (Nuxt 3)
- **Port**: 3002
- **State**: Pinia
- **Stil**: TailwindCSS

### Servisler
| Servis | Port | Durum |
|---|---|---|
| Backend (NestJS) | 3001 | ✅ Aktif |
| Frontend (Nuxt 3) | 3002 | ✅ Aktif |
| Financial Service | 3004 | ✅ Aktif |
| MongoDB | 27017 | ✅ Aktif |
| Redis | 6380 | ✅ Aktif |
| MinIO | 9000/9001 | ✅ Aktif |
| RabbitMQ | 5672 | ✅ Aktif |

---

## Bilinen Açık Konular

| Konu | Öncelik | Not |
|---|---|---|
| `HomeCategoryHighlights` — categoryId filtresi backend'de yok | ORTA | Şu an client-side gruplama yapıyor |
| `VendorProfile.city` schema'ya yoksa city filtresi boş döner | ORTA | VendorProfile koleksiyonunda `city` alanı olmalı |
| Subscription tier yükseltme akışı (BRONZE_P1→DIAMOND_P2) | ORTA | Handler mevcut, UI akışı eksik |
| `resetCache` endpoint'i Redis entegrasyonu | DÜŞÜK | Şu an no-op, gelecekte Redis flush |
| `ExcelBatch` ve API rate limit zorlama | DÜŞÜK | Schema var, enforcement yok |

---

## Çalıştırma

```bash
# Tüm servisler
pnpm dev

# Seed (ilk kurulum)
npx tsx belge/seed/seed-all-mongo.js

# Sadece tier seed
npx tsx belge/seed/seed-tier-benefits-mongo.js
npx tsx belge/seed/seed-user-loyalty-tiers-mongo.js
```

---

*Son güncelleme: 2026-05-20 | Branch: main*
