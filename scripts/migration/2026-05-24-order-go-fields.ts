// scripts/migration/2026-05-24-order-go-fields.ts
// Düzeltme 7/8: orders — isGoOrder, goOrderMode
// Çalıştırma: pnpm ts-node scripts/migration/2026-05-24-order-go-fields.ts

import mongoose from 'mongoose';
import { OrderSchema } from '../../packages/shared/shared-persistence/src/schemas/backend/order.schema';

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI tanımlı değil.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const Order = mongoose.model('Order', OrderSchema);

  console.log('1) isGoOrder default → false...');
  const r1 = await Order.updateMany(
    { isGoOrder: { $exists: false } },
    { $set: { isGoOrder: false } },
  );
  console.log(`   → ${r1.modifiedCount} kayıt güncellendi.`);

  console.log('2) goOrderMode default → null...');
  const r2 = await Order.updateMany(
    { goOrderMode: { $exists: false } },
    { $set: { goOrderMode: null } },
  );
  console.log(`   → ${r2.modifiedCount} kayıt güncellendi.`);

  await mongoose.disconnect();
  console.log('Migration tamamlandı.');
}

main().catch((err) => {
  console.error('Migration hatası:', err);
  process.exit(1);
});