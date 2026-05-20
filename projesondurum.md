# BazarX Proje Son Durum — 2026-05-21

## Genel Bakış

BazarX; TicariTakas (B2B Barter), BazarX (Marketplace), BarterBorsa ve Pazar modüllerinden oluşan çok platformlu bir ticaret ekosistemidir. **BazarX-GO** O2O yiyecek/içecek deneyim modülü olarak ayrıca geliştirilmektedir.

---

## Tamamlanan Geliştirmeler

### Platform Altyapısı
- Tier yönetim sistemi (VendorTier / LoyaltyTier / SubscriptionTier) — uçtan uca
- Ürün görünürlük filtreleri (isFeatured, isFlashSale, isSpecialOffer, city, categoryId)
- API rate limiting — tier bazlı (CORE:60 / PRIME:120 / ELITE:300 / APEX:1000 istek/dk)
- SwapSession timeout cron — 3 kritik hata düzeltildi
- TrustScore cron — 4 hata düzeltildi (level hesabı, auto-freeze, inactivity, @Cron)

### Vendor Tipi Ayrımı (COMMERCE / RESTAURANT)
- `listing` şemasında `vendorType` alanı yok — Vendor join ile çözüldü
- Public/marketplace: RESTAURANT listing'leri otomatik hariç
- `vendorType=RESTAURANT` parametresiyle BazarX-GO endpoint'i ayrışıyor
- Ana sayfa bileşenlerinin tümüne `vendorType=COMMERCE` eklendi

### BazarX-GO (Sprint 1-5 + Tüm Eksikler Tamamlandı)

| Madde | Durum |
|---|---|
| Menü devir, rezervasyon, sürpriz menü | ✅ |
| FCM push, Haversine geofencing, bildirim | ✅ |
| Referans bonus algoritması §7 | ✅ |
| 15 gün aktivasyon bekleme + kupon kilidi | ✅ |
| Gel-Al "üye olsaydın" huneri | ✅ |
| Geofencing vendor koordinatları (VendorProfile lat/lng) | ✅ |
| Mail sağlayıcı (Resend API + SMTP fallback) | ✅ |
| Erken iptal cezası (EARLY_CANCEL_PENALTY) | ✅ |
| XP eşik admin konfigürasyonu | ✅ |
| Restoran detay sayfası fiyat/sıralama filtresi | ✅ |

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
pnpm -F @barterborsa/shared-core build
pnpm dev
npx tsx belge/seed/seed-all-mongo.js

# .env:
# RESEND_API_KEY=...  FCM_SERVER_KEY=...
# SMTP_HOST / SMTP_USER / SMTP_PASSWORD / SMTP_FROM
```

---

*Son güncelleme: 2026-05-21 | Branch: main | Commit: 5b4158d0*
