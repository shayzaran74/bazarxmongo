-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "idempotency_key" TEXT;

-- CreateIndex
CREATE INDEX "orders_user_id_idempotency_key_idx" ON "orders"("user_id", "idempotency_key");
