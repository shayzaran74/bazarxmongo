# BazarX Proje Son Durum — 2026-05-21

## Genel Bakış

BazarX; TicariTakas (B2B Barter), BazarX (Marketplace), BarterBorsa ve Pazar modüllerinden oluşan çok platformlu bir ticaret ekosistemidir. **BazarX-GO** O2O yiyecek/içecek deneyim modülü olarak ayrıca geliştirilmektedir.

---

## Tamamlanan Geliştirmeler

### Platform Altyapısı
- Tier yönetim sistemi (VendorTier / LoyaltyTier / SubscriptionTier) — uçtan uca
- Ürün görünürlük filtreleri (isFeatured, isFlashSale, isSpecialOffer, city, categoryId)
- API rate limiting — tier bazlı (CORE:60 / PRIME:120 / ELITE:300 / APEX:1000 istek/dk)
- SwapSession timeout cron — 3 kritik hata düzeltildi (`deadlineAt→timeoutAt`, `PENDING_COLLATERAL` schema, `setInterval→@Cron 02:05`)
- TrustScore cron — 4 hata düzeltildi (level hesabı, auto-freeze, inactivity tracking, aylık/günlük @Cron)

### BazarX-GO (Sprint 1-5 + Eksikler)

**Sprint 1-4:** Menü devir, rezervasyon, sürpriz menü, FCM push, Haversine geofencing, bildirim servisi

**Sprint 5:** Referans bonus algoritması (§7) — `calculateReferralBonus()`, 3. referansta ücretsiz QR, XP dağıtımı

**Eksikler tamamlandı:**
| Madde | Çözüm |
|---|---|
| 15 gün aktivasyon bekleme | `RedeemMenuHandler` — subscriptionId+15 gün kontrolü, devir/Gel-Al muaf |
| Gel-Al "üye olsaydın" huneri | `order-confirmation.vue` — tasarruf hesabı CTA |
| Geofencing vendor koordinatları | `VendorProfile` lat/lng alanları, `GeofenceService` DB'den çekiyor |
| Mail sağlayıcı | `MailService` — Resend API + SMTP fallback |
| Erken iptal cezası | `CancelSubscriptionHandler` — 16. günden önce EARLY_CANCEL_PENALTY |
| XP eşik admin konfigürasyonu | `GET/PATCH /admin/users/loyalty/xp-thresholds/:tier` + admin UI |

---

## Mevcut Sistem Durumu

### Koleksiyonlar (MongoDB)
`tier_benefits` · `membership_tiers` · `user_levels` · `menu_purchases` · `menu_reservations` · `surprise_menus` · `user_device_tokens` · `launch_partners` · `go_referrals` · `barter_swap_sessions` · `trust_scores`

### Servisler
| Servis | Port | Durum |
|---|---|---|
| Backend (NestJS) | 3001 | ✅ |
| Frontend (Nuxt 3) | 3002 | ✅ |
| Financial Service | 3004 | ✅ |
| Delivery Service | 3005 | ✅ |
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
| Excel batch limit enforcement | ORTA |
| GO bildirim kampanya kuyruğu (BullMQ) | ORTA |
| shared-core CI/CD build adımı | YÜKSEK |

---

## Çalıştırma

```bash
pnpm -F @barterborsa/shared-core build  # ilk kurulumda
pnpm dev
npx tsx belge/seed/seed-all-mongo.js

# .env:
# RESEND_API_KEY=...  (yoksa SMTP fallback)
# SMTP_HOST / SMTP_USER / SMTP_PASSWORD / SMTP_FROM
# FCM_SERVER_KEY=...  (yoksa log modu)
```

---

*Son güncelleme: 2026-05-21 | Branch: main | Commit: da5beb88*
