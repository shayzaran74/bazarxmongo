-- =====================================================
-- BazarX Go Entegrasyonu — Faz 1 Migration
-- Restoran sistemini birinci sınıf VendorType olarak entegre eder
-- =====================================================

-- 1) Yeni enum: VendorType
CREATE TYPE "VendorType" AS ENUM ('COMMERCE', 'RESTAURANT', 'MARKET', 'SERVICE');

-- 2) Vendor tablosuna vendorType alanı ekle (varsayılan COMMERCE)
ALTER TABLE "vendors" ADD COLUMN "vendor_type" "VendorType" NOT NULL DEFAULT 'COMMERCE';
CREATE INDEX "vendors_vendorType_idx" ON "vendors"("vendor_type");

-- 3) VendorProfile'a restoran-özel opsiyonel alanlar
ALTER TABLE "vendor_profiles"
  ADD COLUMN "opening_hours"        JSONB,
  ADD COLUMN "cuisine_type"         TEXT,
  ADD COLUMN "delivery_radius"      DOUBLE PRECISION,
  ADD COLUMN "min_order_amount"     DECIMAL(10, 2),
  ADD COLUMN "avg_prep_time_minutes" INTEGER;

-- 4) VendorSettings'e canlı sipariş kontrol alanları
ALTER TABLE "vendor_settings"
  ADD COLUMN "holiday_mode"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "accepting_orders"  BOOLEAN NOT NULL DEFAULT true;

-- 5) OrderStatus enum'a yeni değerler ekle (sıra korunarak)
ALTER TYPE "OrderStatus" ADD VALUE 'PREPARING' BEFORE 'SHIPPED';
ALTER TYPE "OrderStatus" ADD VALUE 'READY' BEFORE 'SHIPPED';
ALTER TYPE "OrderStatus" ADD VALUE 'AWAITING_PICKUP' BEFORE 'SHIPPED';
ALTER TYPE "OrderStatus" ADD VALUE 'OUT_FOR_DELIVERY' BEFORE 'SHIPPED';

-- 6) DeliveryType enum ve Order.deliveryType
CREATE TYPE "DeliveryType" AS ENUM ('CARGO', 'LOCAL_COURIER', 'PICKUP');
ALTER TABLE "orders" ADD COLUMN "delivery_type" "DeliveryType" NOT NULL DEFAULT 'CARGO';

-- 7) LaunchPartner: restaurant_id → vendor_id (Restaurant drop edileceği için önce taşı)
ALTER TABLE "launch_partners" DROP CONSTRAINT IF EXISTS "launch_partners_restaurant_id_fkey";
ALTER TABLE "launch_partners" DROP CONSTRAINT IF EXISTS "launch_partners_restaurant_id_key";
ALTER TABLE "launch_partners" RENAME COLUMN "restaurant_id" TO "vendor_id";
ALTER TABLE "launch_partners"
  ADD CONSTRAINT "launch_partners_vendor_id_key" UNIQUE ("vendor_id"),
  ADD CONSTRAINT "launch_partners_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 8) MenuPurchase: menu_id → listing_id (BazarXMenu drop edileceği için önce taşı)
ALTER TABLE "menu_purchases" DROP CONSTRAINT IF EXISTS "menu_purchases_menu_id_fkey";
DROP INDEX IF EXISTS "menu_purchases_menu_id_idx";
ALTER TABLE "menu_purchases" RENAME COLUMN "menu_id" TO "listing_id";
CREATE INDEX "menu_purchases_listingId_idx" ON "menu_purchases"("listing_id");
ALTER TABLE "menu_purchases"
  ADD CONSTRAINT "menu_purchases_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 9) Drop deprecated tables (BazarXMenu, Restaurant)
DROP TABLE IF EXISTS "bazarx_menus";
DROP TABLE IF EXISTS "restaurants";
