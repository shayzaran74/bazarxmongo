// scripts/migration/2026-05-24-order-ecosystem-fields.ts
// BazarX Köprüsü — Sprint 3: Order ecosystem alanları
// Çalıştırma: pnpm ts-node scripts/migration/2026-05-24-order-ecosystem-fields.ts

import mongoose from 'mongoose';
import { OrderSchema } from '../../packages/shared/shared-persistence/src/schemas/backend/order.schema';

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI tanımlı değil.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const OrderModel = mongoose.model('Order', OrderSchema);

  console.log('1) Order ecosystem alanları backfill...');
  const result = await OrderModel.updateMany(
    {
      $or: [
        { isEcosystemOrder: { $exists: false } },
        { platformCommissionRate: { $exists: false } },
      ],
    },
    {
      $set: {
        isEcosystemOrder: false,
        platformCommissionRate: mongoose.Types.Decimal128.fromString('0'),
        platformCommissionAmount: mongoose.Types.Decimal128.fromString('0'),
      },
    },
  );
  console.log(`   → ${result.modifiedCount} sipariş güncellendi.`);

  await mongoose.disconnect();
  console.log('Migration tamamlandı.');
}

main().catch((err) => {
  console.error('Migration hatası:', err);
  process.exit(1);
});