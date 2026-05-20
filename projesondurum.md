# BazarX Proje Son Durum — 2026-05-21

## Genel Bakış

BazarX; TicariTakas (B2B Barter), BazarX (Marketplace), BarterBorsa ve Pazar olmak üzere dört ana modülden oluşan çok platformlu bir ticaret ekosistemidir. **BazarX-GO** O2O yiyecek/içecek deneyim modülü olarak ayrıca geliştirilmektedir.

---

## Tamamlanan Geliştirmeler

### 1. Tier Yönetim Sistemi

| Sistem | Değerler | Koleksiyon |
|---|---|---|
| VendorTier | CORE / PRIME / ELITE / APEX | `tier_benefits` |
| LoyaltyTier | BRONZE → DIAMOND | `membership_tiers` |
| SubscriptionTier | BRONZE_P1 → DIAMOND_P2 | `user_subscriptions` |

Admin: `/admin/tier-management`, `/admin/vendor-tiers`, `/admin/user-loyalty`, `/admin/loyalty`

---

### 2. Ürün Görünürlük Sistemi

`isFeatured`, `isFlashSale`, `isSpecialOffer`, `isActive`, `categoryId`, `city` filtreleri backend + frontend. Ana sayfa bileşenleri gerçek API'ye bağlandı.

---

### 3. API Rate Limiting — Tier Bazlı

`TierRateLimitGuard` — CORE:60 / PRIME:120 / ELITE:300 / APEX:1000 istek/dk, admin bypass, `@SkipTierRateLimit()`.

---

### 4. BazarX-GO Sistemi (Sprint 1-5 Tamamlandı)

#### Sprint 1 — Backend Altyapı
- `menuReservation` + `surpriseMenu` şemaları
- `menuPurchase` — devir + kategori alanları
- `TransferMenuHandler`, `CreateReservationHandler`, `UpdateSurpriseMenuHandler`
- Tier ↔ Kategori guard + `MenuCronService` (5 cron)

#### Sprint 2 — Frontend
`/bazarx-go/wallet`, `/bazarx-go/membership`, `/bazarx-go/reservation/[purchaseId]`

#### Sprint 3 — Admin Panel
`/admin/go/restaurants`, `/admin/go/revenue`, `/admin/go/reservations`

#### Sprint 4 — Push / Mail / Geofencing
- `FcmService`, `GoNotificationService`, `GeofenceService` (Haversine)
- `UserDeviceToken` şeması, `/admin/go/notifications`

#### Sprint 5 — Referans Bonus Algoritması (§7)
- `goReferral.schema.ts` — referrerId/refereeId (unique)/refereeTier/bonusPurchaseId
- `referral-bonus.constants.ts` — `findTierByTotal()`, `getBonusTier()`, `calculateReferralBonus()`
- `RegisterGoReferralHandler` — 3. referansta ücretsiz QR, XP dağıtımı, zincirleme engeli
- `GetMyReferralStatusHandler` — progress, bonus durum, nextBonusPreview
- `/bazarx-go/referral` — kod paylaşma, 3 adım progress, bonus kart

```
GET  /api/v1/menu/referral/my-status
POST /api/v1/menu/referral/register
```

---

### 5. SwapSession Timeout Cron — 3 Kritik Hata Düzeltildi ✅

| # | Hata | Etki | Çözüm |
|---|---|---|---|
| 1 | `deadlineAt` → `timeoutAt` alan adı yanlışlığı | **Cron hiç çalışmıyordu** | Repository query düzeltildi |
| 2 | `PENDING_COLLATERAL` schema'da tanımsız | Domain ↔ DB uyumsuzluğu | Schema'ya eklendi |
| 3 | `setInterval(1h)` yerine `@Cron('5 2 * * *')` | Zamanlama yanlıştı | NestJS Schedule decorator ile değiştirildi |

**Zamanlama:** Her gece 02:05 `Europe/Istanbul` (BarterMatchScheduler 02:00'dan 5 dk sonra)

**Etkilenen statüler:** `PENDING_COLLATERAL` → TIMEOUT, `ACTIVE` → TIMEOUT, `SHIPPING` → TIMEOUT

**Teminat iadesi:** Timeout'ta her iki tarafın `fromCollateralHoldId` / `toCollateralHoldId` hold'ları iade edilir. İade başarısız olsa bile timeout geçişi devam eder (audit log'a düşer).

**Yeni Admin Endpoint'ler:**
```
GET  /admin/barter/timeout-monitor?warningDays=3
POST /admin/barter/run-timeout-check
```

---

### 6. Build Düzeltmeleri
- `mongo-loyalty.repositories.ts` — `rawResult` TypeScript hatası
- `shared-core/dist` — stale tsbuildinfo clean rebuild

---

## Mevcut Sistem Durumu

### Veritabanı (MongoDB)
| Koleksiyon | İçerik |
|---|---|
| `tier_benefits` | 4 B2B tier (CORE/PRIME/ELITE/APEX) |
| `membership_tiers` | 5 loyalty tier |
| `user_levels` | Kullanıcı XP kayıtları |
| `menu_purchases` | QR satın alımları |
| `menu_reservations` | Rezervasyonlar |
| `surprise_menus` | Vendor sürpriz menü config |
| `user_device_tokens` | FCM token + konum |
| `launch_partners` | GO restoran anlaşmaları |
| `go_referrals` | Referans + bonus takibi |
| `barter_swap_sessions` | Takas oturumları (timeout düzeltildi) |

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

| Konu | Öncelik |
|---|---|
| B2C subscription ödeme (Iyzico) | YÜKSEK |
| BarterBorsa batch matching engine | YÜKSEK |
| TrustScore cron job | ORTA |
| Excel batch limit enforcement | ORTA |
| GO geofence — vendor koordinat DB'den | ORTA |
| GO bildirim kampanya kuyruğu (BullMQ) | ORTA |
| shared-core CI/CD build adımı | YÜKSEK |

---

## Çalıştırma

```bash
pnpm -F @barterborsa/shared-core build  # ilk kurulumda
pnpm dev
npx tsx belge/seed/seed-all-mongo.js

# .env:
# FCM_SERVER_KEY=...
# SMTP_HOST / SMTP_USER / SMTP_PASSWORD / SMTP_FROM
```

---

*Son güncelleme: 2026-05-21 | Branch: main | Commit: 6cfb6960*
