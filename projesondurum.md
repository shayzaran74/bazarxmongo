# BazarX Proje Son Durum — 2026-05-21

## Genel Bakış

BazarX; TicariTakas (B2B Barter), BazarX (Marketplace), BarterBorsa ve Pazar olmak üzere dört ana modülden oluşan çok platformlu bir ticaret ekosistemidir. **BazarX-GO** O2O (Online-to-Offline) yiyecek/içecek deneyim modülü olarak ayrıca geliştirilmektedir.

---

## Tamamlanan Geliştirmeler

### 1. Tier Yönetim Sistemi

| Sistem | Değerler | Koleksiyon | Amaç |
|---|---|---|---|
| VendorTier | CORE / PRIME / ELITE / APEX | `tier_benefits` | B2B komisyon/limit |
| LoyaltyTier | BRONZE → DIAMOND | `membership_tiers` | XP sadakat |
| SubscriptionTier | BRONZE_P1 → DIAMOND_P2 | `user_subscriptions` | B2C abonelik |

Admin sayfaları: `/admin/tier-management`, `/admin/vendor-tiers`, `/admin/user-loyalty`, `/admin/loyalty`

---

### 2. Ürün Görünürlük Sistemi

`isFeatured`, `isFlashSale`, `isSpecialOffer`, `isActive`, `categoryId`, `city` filtreleri backend + frontend'e eklendi. Ana sayfa bileşenleri gerçek API'ye bağlandı.

---

### 3. API Rate Limiting — Tier Bazlı

`TierRateLimitGuard` — CORE:60 / PRIME:120 / ELITE:300 / APEX:1000 istek/dk, admin bypass, `@SkipTierRateLimit()` dekoratörü.

---

### 4. BazarX-GO Sistemi

#### Sprint 1 — Backend Altyapı ✅
- `menuReservation` + `surpriseMenu` şemaları (yeni)
- `menuPurchase` — devir alanları + `menuCategory`
- `TransferMenuHandler`, `CreateReservationHandler`, `UpdateSurpriseMenuHandler`
- Tier ↔ Kategori guard (`BRONZE_P1`→kat.6, `DIAMOND_P2`→tümü)
- `MenuCronService` — 5 cron job

#### Sprint 2 — Frontend ✅
| Sayfa | URL |
|---|---|
| QR Cüzdanı | `/bazarx-go/wallet` |
| Üyelik Seç | `/bazarx-go/membership` |
| Rezervasyon | `/bazarx-go/reservation/[purchaseId]` |

#### Sprint 3 — Admin Panel ✅
| Sayfa | URL |
|---|---|
| Restoran Anlaşmaları | `/admin/go/restaurants` |
| Kârlılık Dashboard | `/admin/go/revenue` |
| Rezervasyon Yönetimi | `/admin/go/reservations` |

#### Sprint 4 — Push / Mail / Geofencing ✅
- `FcmService` — FCM REST API, mock mod
- `GoNotificationService` — push + mail + DB orkestrasyon, sessiz saat koruması
- `GeofenceService` — Haversine, 500m yarıçap, sıfır bağımlılık
- `UserDeviceToken` şeması, `POST /menu/device-token`
- `/admin/go/notifications` — kampanya sayfası

#### Sprint 5 — Referans Bonus Algoritması ✅

**§7 Tam implementasyon:**

```
3 referansın aidatları → TIER_MAP eşleşmesi → bir alt tier → bonus QR
```

| Bileşen | Detay |
|---|---|
| `goReferral.schema.ts` | referrerId, refereeId (unique), refereeTier, isBonusTrigger, bonusPurchaseId, bonusExpiresAt |
| `referral-bonus.constants.ts` | `findTierByTotal()`, `getBonusTier()`, `calculateReferralBonus()`, TIER_MAP (8 tier × aralık) |
| `RegisterGoReferralHandler` | Self + zincirleme engeli, 3. referansta ücretsiz QR, XP dağıtımı |
| `GetMyReferralStatusHandler` | Referans kodu, progress, bonus durum, nextBonusPreview |
| `MenuCronService` | `referralBonusExpiry` cron (09:00 — 45 gün sonra BONUS_EXPIRED) |
| `/bazarx-go/referral` | Kod paylaşma, 3 adım progress, bonus kart, geçmiş |

**Örnek bonus senaryoları:**
- 3 × BRONZE_P1 (597₺) → BRONZE_P2 eşleşir → **BRONZE_P1 bonus** → Kategori 6
- 2×BRONZE_P2 + 1×SILVER_P1 (1.497₺) → GOLD_P1 eşleşir → **SILVER_P2 bonus** → Kategori 3
- 3 × SILVER_P2 (2.997₺) → DIAMOND_P1 eşleşir → **GOLD_P2 bonus** → Kategori 2

**Güvenlik:** refereeId unique (aynı kişi 2. kez referans alamaz), self-referral engeli, zincirleme yasağı.

**Endpoint'ler:**
```
GET  /api/v1/menu/referral/my-status
POST /api/v1/menu/referral/register
```

---

## Mevcut Sistem Durumu

### Veritabanı (MongoDB)
| Koleksiyon | İçerik |
|---|---|
| `tier_benefits` | 4 B2B tier (CORE/PRIME/ELITE/APEX) |
| `membership_tiers` | 5 loyalty tier (0/1K/5K/15K/50K XP) |
| `user_levels` | Tüm kullanıcı XP kayıtları |
| `menu_purchases` | QR satın alımları (devir + kategori) |
| `menu_reservations` | Rezervasyon kayıtları |
| `surprise_menus` | Vendor sürpriz menü konfigürasyonları |
| `user_device_tokens` | FCM token + konum |
| `launch_partners` | GO restoran anlaşmaları (3 faz) |
| `go_referrals` | Referans kayıtları + bonus takibi |

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
| Excel batch limit enforcement (excelBatchLimit middleware) | ORTA |
| B2C subscription ödeme (Iyzico) | YÜKSEK |
| TrustScore cron job | ORTA |
| SwapSession timeout cron (her gece 02:00) | YÜKSEK |
| BarterBorsa batch matching engine | YÜKSEK |
| GO geofence — vendor koordinat kaynağı (DB'den) | ORTA |
| GO bildirim kampanya kuyruğu (BullMQ) | ORTA |
| shared-core CI/CD build adımı | YÜKSEK |

---

## Çalıştırma

```bash
pnpm -F @barterborsa/shared-core build  # ilk kurulumda veya değişiklik sonrası
pnpm dev
npx tsx belge/seed/seed-all-mongo.js    # ilk kurulum

# Gerekli .env:
# FCM_SERVER_KEY=...  SMTP_HOST/USER/PASSWORD/FROM
```

---

*Son güncelleme: 2026-05-21 | Branch: main | Commit: 45c0d19e*
