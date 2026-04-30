/*
  Warnings:

  - The values [PLUS,PREMIUM] on the enum `VendorTier` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[referral_code]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('BRONZE_P1', 'BRONZE_P2', 'SILVER_P1', 'SILVER_P2', 'GOLD_P1', 'GOLD_P2', 'DIAMOND_P1', 'DIAMOND_P2');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'CANCELLED', 'EXPIRED', 'PAUSED');

-- CreateEnum
CREATE TYPE "MenuPurchaseStatus" AS ENUM ('ACTIVE', 'REDEEMED', 'PARTIALLY_REDEEMED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GiftVoucherType" AS ENUM ('BIRTHDAY', 'ANNIVERSARY', 'THREE_MONTH', 'REFERRAL_BONUS', 'ADMIN_MANUAL');

-- CreateEnum
CREATE TYPE "LaunchPartnerPhase" AS ENUM ('PHASE_1', 'PHASE_2', 'PHASE_3');

-- AlterEnum
BEGIN;
CREATE TYPE "VendorTier_new" AS ENUM ('CORE', 'PRIME', 'ELITE', 'APEX');
ALTER TABLE "vendors" ALTER COLUMN "tier" DROP DEFAULT;
ALTER TABLE "vendors" ALTER COLUMN "tier" TYPE "VendorTier_new" USING ("tier"::text::"VendorTier_new");
ALTER TABLE "xp_distribution_rules" ALTER COLUMN "vendor_tier" TYPE "VendorTier_new" USING ("vendor_tier"::text::"VendorTier_new");
ALTER TABLE "xp_spending_limit_rules" ALTER COLUMN "vendor_tier" TYPE "VendorTier_new" USING ("vendor_tier"::text::"VendorTier_new");
ALTER TYPE "VendorTier" RENAME TO "VendorTier_old";
ALTER TYPE "VendorTier_new" RENAME TO "VendorTier";
DROP TYPE "VendorTier_old";
ALTER TABLE "vendors" ALTER COLUMN "tier" SET DEFAULT 'CORE';
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "referral_code" TEXT;

-- AlterTable
ALTER TABLE "xp_transactions" ADD COLUMN     "eroded_at" TIMESTAMP(3),
ADD COLUMN     "expires_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "membership_plans" (
    "id" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "monthly_fee" DECIMAL(18,2) NOT NULL,
    "annual_fee" DECIMAL(18,2),
    "menu_credit" DECIMAL(18,2) NOT NULL,
    "breakeven" DECIMAL(18,2) NOT NULL,
    "benefits" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "next_billing_date" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "downgrade_protected_until" TIMESTAMP(3),
    "referral_discount_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_usages" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "used_credit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_credit" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "menu_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "vendor_id" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "category" TEXT,
    "image_url" TEXT,
    "average_menu_price" DECIMAL(18,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bazarx_menus" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "original_price" DECIMAL(18,2) NOT NULL,
    "discounted_price" DECIMAL(18,2) NOT NULL,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "daily_limit" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bazarx_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "paid_amount" DECIMAL(18,2) NOT NULL,
    "service_fee" DECIMAL(18,2) NOT NULL,
    "vat_amount" DECIMAL(18,2) NOT NULL,
    "qr_code" TEXT NOT NULL,
    "qr_expires_at" TIMESTAMP(3) NOT NULL,
    "one_free_qr_code" TEXT,
    "one_free_activated_at" TIMESTAMP(3),
    "one_free_used_at" TIMESTAMP(3),
    "status" "MenuPurchaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_redemptions" (
    "id" TEXT NOT NULL,
    "purchase_id" TEXT NOT NULL,
    "is_one_free" BOOLEAN NOT NULL DEFAULT false,
    "redeemed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scanned_by_staff" TEXT,

    CONSTRAINT "menu_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_vouchers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "type" "GiftVoucherType" NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "redeemed_at" TIMESTAMP(3),
    "order_id" TEXT,
    "issued_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referee_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "xp_granted" INTEGER NOT NULL DEFAULT 0,
    "bonus_granted" BOOLEAN NOT NULL DEFAULT false,
    "reward_granted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "launch_partners" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "phase" "LaunchPartnerPhase" NOT NULL DEFAULT 'PHASE_1',
    "pledged_menu_count" INTEGER NOT NULL DEFAULT 60,
    "distributed_count" INTEGER NOT NULL DEFAULT 0,
    "free_ad_months" INTEGER NOT NULL DEFAULT 1,
    "ad_months_used" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phase2_start_date" TIMESTAMP(3),
    "phase3_start_date" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "launch_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_scores" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "trading_performance" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "xp_loyalty" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "compliance" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_frozen" BOOLEAN NOT NULL DEFAULT false,
    "violation_count" INTEGER NOT NULL DEFAULT 0,
    "inactive_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blind_pools" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "total_stock" DECIMAL(18,2) NOT NULL,
    "available_stock" DECIMAL(18,2) NOT NULL,
    "smart_cap_pct" DECIMAL(5,2) NOT NULL DEFAULT 25,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blind_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blind_pool_entries" (
    "id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "quantity" DECIMAL(18,2) NOT NULL,
    "is_reserved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blind_pool_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "membership_plans_tier_key" ON "membership_plans"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_user_id_key" ON "user_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "user_subscriptions_user_id_idx" ON "user_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "user_subscriptions_status_idx" ON "user_subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "menu_usages_subscription_id_month_year_key" ON "menu_usages"("subscription_id", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");

-- CreateIndex
CREATE INDEX "restaurants_city_idx" ON "restaurants"("city");

-- CreateIndex
CREATE INDEX "restaurants_category_idx" ON "restaurants"("category");

-- CreateIndex
CREATE INDEX "bazarx_menus_restaurant_id_idx" ON "bazarx_menus"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "menu_purchases_qr_code_key" ON "menu_purchases"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "menu_purchases_one_free_qr_code_key" ON "menu_purchases"("one_free_qr_code");

-- CreateIndex
CREATE INDEX "menu_purchases_user_id_idx" ON "menu_purchases"("user_id");

-- CreateIndex
CREATE INDEX "menu_purchases_menu_id_idx" ON "menu_purchases"("menu_id");

-- CreateIndex
CREATE INDEX "menu_purchases_status_idx" ON "menu_purchases"("status");

-- CreateIndex
CREATE INDEX "menu_redemptions_purchase_id_idx" ON "menu_redemptions"("purchase_id");

-- CreateIndex
CREATE UNIQUE INDEX "gift_vouchers_code_key" ON "gift_vouchers"("code");

-- CreateIndex
CREATE INDEX "gift_vouchers_user_id_idx" ON "gift_vouchers"("user_id");

-- CreateIndex
CREATE INDEX "gift_vouchers_code_idx" ON "gift_vouchers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referee_id_key" ON "referrals"("referee_id");

-- CreateIndex
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");

-- CreateIndex
CREATE UNIQUE INDEX "launch_partners_restaurant_id_key" ON "launch_partners"("restaurant_id");

-- CreateIndex
CREATE UNIQUE INDEX "trust_scores_vendor_id_key" ON "trust_scores"("vendor_id");

-- CreateIndex
CREATE INDEX "blind_pools_group_id_idx" ON "blind_pools"("group_id");

-- CreateIndex
CREATE INDEX "blind_pool_entries_pool_id_idx" ON "blind_pool_entries"("pool_id");

-- CreateIndex
CREATE INDEX "blind_pool_entries_listing_id_idx" ON "blind_pool_entries"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "xp_transactions_expires_at_idx" ON "xp_transactions"("expires_at");

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_usages" ADD CONSTRAINT "menu_usages_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "user_subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bazarx_menus" ADD CONSTRAINT "bazarx_menus_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_purchases" ADD CONSTRAINT "menu_purchases_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "bazarx_menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_redemptions" ADD CONSTRAINT "menu_redemptions_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "menu_purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "launch_partners" ADD CONSTRAINT "launch_partners_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blind_pool_entries" ADD CONSTRAINT "blind_pool_entries_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "blind_pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blind_pool_entries" ADD CONSTRAINT "blind_pool_entries_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
