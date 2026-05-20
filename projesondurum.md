# BazarX Proje Son Durum — 2026-05-21

## Genel Bakış

BazarX; TicariTakas (B2B Barter), BazarX (Marketplace), BarterBorsa ve Pazar olmak üzere dört ana modülden oluşan çok platformlu bir ticaret ekosistemidir. **BazarX-GO** O2O (Online-to-Offline) yiyecek/içecek deneyim modülü olarak ayrıca geliştirilmektedir.

---

## Tamamlanan Geliştirmeler

### 1. Tier Yönetim Sistemi (Uçtan Uca)

#### 3 Ayrı Tier Sistemi
| Sistem | Değerler | Koleksiyon | Amaç |
|---|---|---|---|
| VendorTier | CORE / PRIME / ELITE / APEX | `tier_benefits` | B2B TicariTakas komisyon/limit |
| LoyaltyTier | BRONZE → DIAMOND | `membership_tiers` | XP tabanlı sadakat |
| SubscriptionTier | BRONZE_P1 → DIAMOND_P2 | `user_subscriptions` | B2C ücretli abonelik |

#### Admin Sayfaları
- `/admin/tier-management` — B2B tier parametreleri
- `/admin/vendor-tiers` — Satıcı tier atama
- `/admin/user-loyalty` — Kullanıcı XP/tier
- `/admin/loyalty` — 3 sekmeli XP sistem ayarları
- `/tier-info` — Vendor tier karşılaştırma + yükseltme UI

---

### 2. Ürün Görünürlük Sistemi

- `isFeatured`, `isFlashSale`, `isSpecialOffer`, `isActive`, `categoryId`, `city` filtreleri
- Admin tablo badge kolonları, composable filtre state
- Ana sayfa bileşenleri gerçek API'ye bağlandı

---

### 3. API Rate Limiting — Tier Bazlı

- `TierRateLimitGuard` — CACHE_MANAGER ile vendor başına dakikalık limit
- CORE:60 / PRIME:120 / ELITE:300 / APEX:1000 istek/dk
- Admin/public otomatik bypass, `@SkipTierRateLimit()` dekoratörü

---

### 4. BazarX-GO Sistemi (4 Sprint Tamamlandı)

#### Sprint 1 — Backend Altyapı ✅
| Yenilik | Detay |
|---|---|
| `menuPurchase` şeması | Devir alanları (`isTransferred`, `transferredTo/From/At`), `menuCategory` |
| `menuReservation` şeması (yeni) | PENDING/CONFIRMED/CANCELLED/COMPLETED/NO_SHOW, 1 QR = 1 rezervasyon |
| `surpriseMenu` şeması (yeni) | Vendor opt-in, saatlik blok, günlük kota, 500m yarıçap |
| `TransferMenuHandler` | QR devir — 45 gün penceresi korunur, geri alınamaz |
| `CreateReservationHandler` | Tarih/saat/kişi + durum kontrolü |
| `UpdateSurpriseMenuHandler` | Vendor sürpriz menü upsert |
| `TIER_MIN_CATEGORY` haritası | BRONZE_P1→kat.6, DIAMOND_P2→tümü (PurchaseMenuHandler guard) |
| `MenuCronService` | Expiry, 3 gün uyarı, ay sonu burn, sürpriz reset, rezervasyon cleanup |

**Yeni Endpointler (Sprint 1):**
```
GET  /menu/wallet          POST /menu/transfer/:id
POST /menu/reservation/:id  PUT  /menu/surprise-menu
GET  /menu/surprise-menus
```

#### Sprint 2 — Frontend Sayfaları ✅
| Sayfa | URL | İçerik |
|---|---|---|
| QR Cüzdanı | `/bazarx-go/wallet` | Aktif/sona eren filtre, devir modal, 1+1 aktivasyon, rezervasyon butonu |
| Üyelik Seç | `/bazarx-go/membership` | 8 tier karşılaştırma, kategori erişimi, anlık üyelik başlatma |
| Rezervasyon | `/bazarx-go/reservation/[purchaseId]` | 4 adım: Restoran→Tarih→Saat→Kişi |

#### Sprint 3 — Admin Panel ✅
| Sayfa | URL | İçerik |
|---|---|---|
| Restoran Anlaşmaları | `/admin/go/restaurants` | LaunchPartner 3 faz yönetimi, 60 menü kota progress |
| Kârlılık Dashboard | `/admin/go/revenue` | Brüt/net gelir, QR stats, rezervasyon özeti, kategori bar chart |
| Rezervasyon Yönetimi | `/admin/go/reservations` | Durum filtreli, inline onayla/iptal |

**Yeni Endpointler (Sprint 3 — `/admin/go`):**
```
GET/POST /launch-partners    PUT /launch-partners/:id/advance
GET /revenue?period=30       GET/PATCH /reservations
```

#### Sprint 4 — Push / Mail / Geofencing ✅
| Servis | Açıklama |
|---|---|
| `FcmService` | FCM REST API, batch gönderim, mock mod (env yoksa log) |
| `GoNotificationService` | Push + Mail + DB orkestrasyonu, sessiz saat (22:00-08:00) koruması |
| `GeofenceService` | Haversine formülü, 500m yarıçap, sıfır bağımlılık |
| `UserDeviceToken` şeması | FCM token + konum + bildirim tercihleri |

**Bildirim Tipleri:**
`MENU_EXPIRY_WARNING` · `MENU_TRANSFER_RECEIVED` · `RESERVATION_CONFIRMED` · `RESERVATION_CANCELLED` · `SURPRISE_MENU_NEARBY` · `NEW_RESTAURANT_NEARBY`

**Admin:** `/admin/go/notifications` — Push & Mail kampanya sayfası

**Gerekli .env:**
```
FCM_SERVER_KEY=AAAAxxxxx...   # Firebase Console → Cloud Messaging
SMTP_HOST / SMTP_USER / SMTP_PASSWORD / SMTP_FROM
```

---

### 5. Build Düzeltmeleri
- `mongo-loyalty.repositories.ts` — `rawResult` TypeScript hatası giderildi
- `shared-core/dist` — stale tsbuildinfo clean rebuild

---

## Mevcut Sistem Durumu

### Veritabanı (MongoDB)
| Koleksiyon | İçerik |
|---|---|
| `tier_benefits` | 4 B2B tier (CORE/PRIME/ELITE/APEX) |
| `membership_tiers` | 5 loyalty tier (0/1K/5K/15K/50K XP) |
| `user_levels` | Tüm kullanıcı XP kayıtları |
| `menu_purchases` | QR satın alımları (devir + kategori alanları) |
| `menu_reservations` | Rezervasyon kayıtları |
| `surprise_menus` | Vendor sürpriz menü konfigürasyonları |
| `user_device_tokens` | FCM token + konum verisi |
| `launch_partners` | GO restoran anlaşmaları (3 faz) |

### Servisler
| Servis | Port | Durum |
|---|---|---|
| Backend (NestJS) | 3001 | ✅ |
| Frontend (Nuxt 3) | 3002 | ✅ |
| Financial Service | 3004 | ✅ |
| Delivery Service | 3003 | ✅ |
| MongoDB | 27017 | ✅ |
| Redis | 6380 | ✅ |
| MinIO | 9000/9001 | ✅ |
| RabbitMQ | 5672 | ✅ |

---

## Sonraki Sprint Önerileri

| Konu | Öncelik | Notlar |
|---|---|---|
| Excel batch upload limit zorlama | ORTA | `excelBatchLimit` şemada var, middleware yok |
| B2C subscription ödeme (Iyzico) | YÜKSEK | Handler var, ödeme entegrasyonu yok |
| TrustScore cron job | ORTA | Algoritma §TrustScore'da tanımlı |
| SwapSession timeout cron | YÜKSEK | Her gece 02:00 — handler var, cron yok |
| BarterBorsa batch matching engine | YÜKSEK | §4 tanımlı, implementasyon yok |
| GO geofence gerçek vendor koordinatları | ORTA | Şu an vendorCoords client'tan geliyor |
| GO bildirim kampanya kuyruğu (BullMQ) | ORTA | Admin sayfası stub — gerçek gönderim yok |
| shared-core CI/CD build adımı | YÜKSEK | `pnpm -F @barterborsa/shared-core build` |

---

## Çalıştırma

```bash
# shared-core (ilk kurulum veya kaynak değişikliğinde)
pnpm -F @barterborsa/shared-core build

# Tüm servisler
pnpm dev

# Seed (ilk kurulum)
npx tsx belge/seed/seed-all-mongo.js
```

---

*Son güncelleme: 2026-05-21 | Branch: main | Commit: 17c1f199*
