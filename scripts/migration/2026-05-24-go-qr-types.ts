// scripts/migration/2026-05-24-go-qr-types.ts
// Düzeltme 5: menu_purchases — qrType, platformExpiresAt, activationDate, restaurantExpiresAt, instantQrDurationHours, instantQrSlotId
// Düzeltme 4: menu_purchases — purchaseType, previewCategoryId, previewUsedAt
// Çalıştırma: pnpm ts-node scripts/migration/2026-05-24-go-qr-types.ts

import mongoose from 'mongoose';
import { MenuPurchaseSchema } from '../../packages/shared/shared-persistence/src/schemas/backend/menuPurchase.schema';

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI tanımlı değil.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const MenuPurchase = mongoose.model('MenuPurchase', MenuPurchaseSchema);

  console.log('1) qrType default → PLATFORM...');
  const r1 = await MenuPurchase.updateMany(
    { qrType: { $exists: false } },
    { $set: { qrType: 'PLATFORM' } },
  );
  console.log(`   → ${r1.modifiedCount} kayıt güncellendi.`);

  console.log('2) purchaseType default → STANDARD...');
  const r2 = await MenuPurchase.updateMany(
    { purchaseType: { $exists: false } },
    { $set: { purchaseType: 'STANDARD' } },
  );
  console.log(`   → ${r2.modifiedCount} kayıt güncellendi.`);

  await mongoose.disconnect();
  console.log('Migration tamamlandı.');
}

main().catch((err) => {
  console.error('Migration hatası:', err);
  process.exit(1);
});