/*
  Warnings:

  - The `status` column on the `barter_dispute_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "B2BSubscriptionStatus" AS ENUM ('ACTIVE', 'GRACE_PERIOD', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DisputeResolutionStatus" AS ENUM ('OPEN', 'AUTO_REVIEW', 'MANUAL_REVIEW', 'ARBITRATION', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('PENDING_ASSIGN', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "barter_dispute_logs" DROP COLUMN "status",
ADD COLUMN     "status" "DisputeResolutionStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "home_quad_cards" ADD COLUMN     "link" TEXT;

-- AlterTable
ALTER TABLE "vendor_b2b_data" ADD COLUMN     "first_transaction_at" TIMESTAMP(3),
ADD COLUMN     "last_paid_at" TIMESTAMP(3),
ADD COLUMN     "subscription_expires_at" TIMESTAMP(3),
ADD COLUMN     "subscription_started_at" TIMESTAMP(3),
ADD COLUMN     "subscription_status" "B2BSubscriptionStatus" NOT NULL DEFAULT 'EXPIRED';

-- CreateTable
CREATE TABLE "delivery_dispatches" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "courier_id" TEXT,
    "status" "DispatchStatus" NOT NULL DEFAULT 'PENDING_ASSIGN',
    "picked_up_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_dispatches_order_id_key" ON "delivery_dispatches"("order_id");

-- CreateIndex
CREATE INDEX "delivery_dispatches_order_id_idx" ON "delivery_dispatches"("order_id");

-- CreateIndex
CREATE INDEX "delivery_dispatches_courier_id_idx" ON "delivery_dispatches"("courier_id");

-- CreateIndex
CREATE INDEX "delivery_dispatches_status_idx" ON "delivery_dispatches"("status");

-- CreateIndex
CREATE INDEX "vendor_b2b_data_subscription_status_subscription_expires_at_idx" ON "vendor_b2b_data"("subscription_status", "subscription_expires_at");

-- AddForeignKey
ALTER TABLE "delivery_dispatches" ADD CONSTRAINT "delivery_dispatches_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "menu_purchases_listingId_idx" RENAME TO "menu_purchases_listing_id_idx";

-- RenameIndex
ALTER INDEX "vendors_vendorType_idx" RENAME TO "vendors_vendor_type_idx";
