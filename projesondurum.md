# BazarX Proje Son Durum — 2026-05-21

## Genel Bakış

BazarX; TicariTakas (B2B Barter), BazarX (Marketplace), BarterBorsa ve Pazar modüllerinden oluşan çok platformlu bir ticaret ekosistemidir. **BazarX-GO** O2O yiyecek/içecek deneyim modülü olarak ayrıca geliştirilmektedir.

---

## Tamamlanan Geliştirmeler

### Platform Altyapısı
- Tier yönetim sistemi (VendorTier / LoyaltyTier / SubscriptionTier) — uçtan uca
- Ürün görünürlük filtreleri (isFeatured, isFlashSale, isSpecialOffer, city, categoryId)
- API rate limiting — tier bazlı
- SwapSession timeout cron — 3 kritik hata düzeltildi
- TrustScore cron — 4 hata düzeltildi

### Vendor Tipi Ayrımı (COMMERCE / RESTAURANT)
- Listing şemasında vendorType alanı yok — Vendor join ile çözüldü
- Public/marketplace: RESTAURANT listing'leri otomatik hariç
- `vendorType=RESTAURANT` parametresiyle BazarX-GO endpoint'i ayrışıyor
- Ana sayfa bileşenlerine `vendorType=COMMERCE` eklendi
- Migration script: `belge/seed/migrate-vendor-types-mongo.js`

### Vendor Dashboard — Settings (Düzeltildi)
7 kritik sorun giderildi:

| Sorun | Düzeltme |
|---|---|
| Form alanları DB ile eşleşmiyordu (`businessName`→`storeName` vb.) | Tüm alan adları düzeltildi |
| `saveSettings` → `PUT /api/vendors/:id` (endpoint yok) | `PATCH /api/v1/vendors/profile/me` |
| `fetchVendorProducts` → `/api/products` (endpoint yok) | `/api/v1/listings/marketplace?vendorId=` |
| Profil kaydında banka/vitrin alanları şemada yoktu | VendorProfile şemasına eklendi |
| `GetVendorProfileHandler` vendor id/status dönmüyordu | Vendor + profil birleşik döndürüyor |
| Profil güncelleme endpoint'i yoktu | `PATCH /vendors/profile/me` eklendi |
| `UpdateVendorProfileCommand/Handler` yoktu | Upsert mantığıyla oluşturuldu |

**VendorProfile şemasına eklenen alanlar:**
`phone` · `whatsapp` · `website` · `address` · `zipCode` · `country`
`bankName` · `bankAccountName` · `bankIban`
`adProductIdLeft/Right` · `showAd` · `showFlashSales` · `flashProductIds`

### BazarX-GO Sistemi (Sprint 1-5 + Tüm Eksikler)
- Menü devir, rezervasyon, sürpriz menü, FCM push, geofencing ✅
- Referans bonus algoritması §7 ✅
- 15 gün aktivasyon, Gel-Al huneri, erken iptal cezası ✅
- XP eşik admin konfigürasyonu ✅
- Restoran sol menü: gerçek veri, scroll-spy, emoji kategoriler ✅
- Restoran ürünleri limit fix (12→100), isim fallback, logo alanı ✅
- RESTAURANT/COMMERCE vendor ayrımı marketplace'te ✅

---

## Mevcut Sistem Durumu

### Koleksiyonlar (MongoDB)
`tier_benefits` · `membership_tiers` · `user_levels` · `menu_purchases` · `menu_reservations` · `surprise_menus` · `user_device_tokens` · `launch_partners` · `go_referrals` · `barter_swap_sessions` · `trust_scores` · `vendor_profiles` (genişletildi)

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

# Vendor tipi migration (yeni restoran eklenince):
npx tsx belge/seed/migrate-vendor-types-mongo.js

# .env:
# RESEND_API_KEY=...  FCM_SERVER_KEY=...
# SMTP_HOST / SMTP_USER / SMTP_PASSWORD / SMTP_FROM
```

---

*Son güncelleme: 2026-05-21 | Branch: main | Commit: de3420b2*
