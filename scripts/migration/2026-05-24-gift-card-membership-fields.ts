// scripts/migration/2026-05-24-gift-card-membership-fields.ts
// Düzeltme 3: gift_cards — giftCardSource, membershipId, activationPercent, expiresAfterMembershipEndDays
// Çalıştırma: pnpm ts-node scripts/migration/2026-05-24-gift-card-membership-fields.ts

import mongoose from 'mongoose';
import { GiftCardSchema } from '../../packages/shared/shared-persistence/src/schemas/financial/giftCard.schema';

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI tanımlı değil.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const GiftCard = mongoose.model('GiftCard', GiftCardSchema);

  const r1 = await GiftCard.updateMany(
    { giftCardSource: { $exists: false } },
    { $set: { giftCardSource: 'PURCHASE' } },
  );
  console.log(`1) giftCardSource → PURCHASE: ${r1.modifiedCount} kayıt.`);

  await mongoose.disconnect();
  console.log('Migration tamamlandı.');
}

main().catch((err) => {
  console.error('Migration hatası:', err);
  process.exit(1);
});