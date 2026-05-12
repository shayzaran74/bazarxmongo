/*
  Warnings:

  - A unique constraint covering the columns `[hold_id]` on the table `auction_bids` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'DISPUTED';

-- AlterEnum
ALTER TYPE "ParticipationStatus" ADD VALUE 'REJECTED';

-- AlterEnum
ALTER TYPE "SurplusStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "auction_bids" ADD COLUMN     "hold_id" TEXT;

-- AlterTable
ALTER TABLE "group_buys" ADD COLUMN     "product_id" TEXT,
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "tiers" JSONB,
ADD COLUMN     "title" VARCHAR(255),
ALTER COLUMN "target_quantity" SET DEFAULT 0,
ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "escrow_hold_id" TEXT;

-- AlterTable
ALTER TABLE "surplus_items" ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "rejection_reason" TEXT;

-- CreateTable
CREATE TABLE "outbox_messages" (
    "id" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "exchange" TEXT NOT NULL DEFAULT '',
    "routingKey" TEXT NOT NULL DEFAULT '',
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "outbox_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbox_messages_status_created_at_idx" ON "outbox_messages"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "auction_bids_hold_id_key" ON "auction_bids"("hold_id");

-- CreateIndex
CREATE INDEX "group_buys_product_id_idx" ON "group_buys"("product_id");

-- AddForeignKey
ALTER TABLE "auction_participations" ADD CONSTRAINT "auction_participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_bids" ADD CONSTRAINT "auction_bids_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
