/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `listings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "category_id" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "barter_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "escrow_coupons" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION,
    "min_amount" DOUBLE PRECISION,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrow_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount_amount" DOUBLE PRECISION,
    "discount_percentage" DOUBLE PRECISION,
    "min_order_amount" DOUBLE PRECISION,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'PENDING',
    "totalRows" INTEGER NOT NULL,
    "processedRows" INTEGER NOT NULL DEFAULT 0,
    "createdRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_escrow_coupons_cart_id" ON "escrow_coupons"("cart_id");

-- CreateIndex
CREATE INDEX "idx_escrow_coupons_user_id" ON "escrow_coupons"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "ImportJob_adminId_idx" ON "ImportJob"("adminId");

-- CreateIndex
CREATE INDEX "ImportJob_status_idx" ON "ImportJob"("status");

-- CreateIndex
CREATE INDEX "ad_campaigns_vendor_id_idx" ON "ad_campaigns"("vendor_id");

-- CreateIndex
CREATE INDEX "analytics_events_category_id_idx" ON "analytics_events"("category_id");

-- CreateIndex
CREATE INDEX "analytics_events_listing_id_idx" ON "analytics_events"("listing_id");

-- CreateIndex
CREATE INDEX "analytics_events_vendor_id_idx" ON "analytics_events"("vendor_id");

-- CreateIndex
CREATE INDEX "auctions_user_id_idx" ON "auctions"("user_id");

-- CreateIndex
CREATE INDEX "barter_dispute_logs_trade_offer_id_idx" ON "barter_dispute_logs"("trade_offer_id");

-- CreateIndex
CREATE INDEX "barter_parts_sender_id_idx" ON "barter_parts"("sender_id");

-- CreateIndex
CREATE INDEX "barter_swap_sessions_receiver_id_idx" ON "barter_swap_sessions"("receiver_id");

-- CreateIndex
CREATE INDEX "brands_vendor_id_idx" ON "brands"("vendor_id");

-- CreateIndex
CREATE INDEX "catalog_models_category_id_idx" ON "catalog_models"("category_id");

-- CreateIndex
CREATE INDEX "catalog_products_category_id_idx" ON "catalog_products"("category_id");

-- CreateIndex
CREATE INDEX "disputes_user_id_idx" ON "disputes"("user_id");

-- CreateIndex
CREATE INDEX "disputes_vendor_id_idx" ON "disputes"("vendor_id");

-- CreateIndex
CREATE INDEX "group_buys_listing_id_idx" ON "group_buys"("listing_id");

-- CreateIndex
CREATE INDEX "home_quad_card_items_product_id_idx" ON "home_quad_card_items"("product_id");

-- CreateIndex
CREATE INDEX "listing_images_listing_id_idx" ON "listing_images"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "listings_barcode_key" ON "listings"("barcode");

-- CreateIndex
CREATE INDEX "login_history_user_id_idx" ON "login_history"("user_id");

-- CreateIndex
CREATE INDEX "lotteries_listing_id_idx" ON "lotteries"("listing_id");

-- CreateIndex
CREATE INDEX "order_returns_order_id_idx" ON "order_returns"("order_id");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_idx" ON "order_status_history"("order_id");

-- CreateIndex
CREATE INDEX "order_status_history_user_id_idx" ON "order_status_history"("user_id");

-- CreateIndex
CREATE INDEX "orders_expires_at_idx" ON "orders"("expires_at");

-- CreateIndex
CREATE INDEX "product_activities_user_id_idx" ON "product_activities"("user_id");

-- CreateIndex
CREATE INDEX "purchase_order_items_listing_id_idx" ON "purchase_order_items"("listing_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "reviews_order_id_idx" ON "reviews"("order_id");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sso_tokens_user_id_idx" ON "sso_tokens"("user_id");

-- CreateIndex
CREATE INDEX "stock_reservations_order_id_idx" ON "stock_reservations"("order_id");

-- CreateIndex
CREATE INDEX "surplus_items_company_id_idx" ON "surplus_items"("company_id");

-- CreateIndex
CREATE INDEX "trade_offer_items_listing_id_idx" ON "trade_offer_items"("listing_id");

-- CreateIndex
CREATE INDEX "trade_offers_from_company_id_idx" ON "trade_offers"("from_company_id");

-- CreateIndex
CREATE INDEX "trade_offers_to_company_id_idx" ON "trade_offers"("to_company_id");

-- CreateIndex
CREATE INDEX "transfer_items_listing_id_idx" ON "transfer_items"("listing_id");

-- CreateIndex
CREATE INDEX "user_addresses_user_id_idx" ON "user_addresses"("user_id");

-- CreateIndex
CREATE INDEX "user_profiles_first_name_idx" ON "user_profiles"("first_name");

-- CreateIndex
CREATE INDEX "user_profiles_last_name_idx" ON "user_profiles"("last_name");

-- CreateIndex
CREATE INDEX "vendor_banners_vendor_id_idx" ON "vendor_banners"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_categories_category_id_idx" ON "vendor_categories"("category_id");

-- CreateIndex
CREATE INDEX "vendor_categories_vendor_id_idx" ON "vendor_categories"("vendor_id");

-- CreateIndex
CREATE INDEX "verification_tokens_user_id_idx" ON "verification_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_coupons" ADD CONSTRAINT "escrow_coupons_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
