# Faz 0 Migration Notları — Master Plan v4.3

## VendorTier Yeniden Adlandırma

Mevcut veriler varsa bu SQL çalıştırılmalı:

```sql
-- PLUS → PRIME
UPDATE vendors SET tier = 'PRIME' WHERE tier = 'PLUS';
UPDATE xp_distribution_rules SET vendor_tier = 'PRIME' WHERE vendor_tier = 'PLUS';
UPDATE xp_spending_limit_rules SET vendor_tier = 'PRIME' WHERE vendor_tier = 'PLUS';

-- PREMIUM → ELITE (eski ELITE → APEX)
UPDATE vendors SET tier = 'APEX'  WHERE tier = 'ELITE';
UPDATE vendors SET tier = 'ELITE' WHERE tier = 'PREMIUM';
UPDATE xp_distribution_rules SET vendor_tier = 'APEX'  WHERE vendor_tier = 'ELITE';
UPDATE xp_distribution_rules SET vendor_tier = 'ELITE' WHERE vendor_tier = 'PREMIUM';
UPDATE xp_spending_limit_rules SET vendor_tier = 'APEX'  WHERE vendor_tier = 'ELITE';
UPDATE xp_spending_limit_rules SET vendor_tier = 'ELITE' WHERE vendor_tier = 'PREMIUM';
```

## Sonraki Adımlar

```bash
# 1. Schema güncelle
pnpm prisma:push

# 2. Client üret
pnpm prisma:generate

# 3. Seed data yükle
pnpm prisma:seed
```

## Yeni Tablolar (Faz 0)

- `membership_plans` — 8 abonelik kademesi
- `user_subscriptions` — kullanıcı abonelik kaydı
- `menu_usages` — aylık menü hakkı takibi
- `restaurants` — anlaşmalı restoranlar
- `bazarx_menus` — menü kartları
- `menu_purchases` — QR satın alım
- `menu_redemptions` — QR kullanım
- `gift_vouchers` — hediye çekleri
- `referrals` — referans takibi
- `launch_partners` — lansman ortakları
- `trust_scores` — TicariTakas B2B trust
- `blind_pools` — BarterBorsa kör havuz
- `blind_pool_entries` — havuz girişleri
