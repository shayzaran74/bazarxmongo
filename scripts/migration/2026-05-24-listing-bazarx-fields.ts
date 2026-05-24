// scripts/migration/2026-05-24-listing-bazarx-fields.ts
// BazarX Publish — Sprint 3: bazarxPublished ve internetSalesEnabled alanları
// Çalıştırma: pnpm ts-node scripts/migration/2026-05-24-listing-bazarx-fields.ts

import mongoose from 'mongoose';
import { ListingSchema } from '../../packages/shared/shared-persistence/src/schemas/backend/listing.schema';

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI tanımlı değil.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const ListingModel = mongoose.model('Listing', ListingSchema);

  console.log('1) bazarxPublished default backfill...');
  const publishedResult = await ListingModel.updateMany(
    { bazarxPublished: { $exists: false } },
    { $set: { bazarxPublished: { published: false } } },
  );
  console.log(`   → ${publishedResult.modifiedCount} kayıt güncellendi.`);

  console.log('2) internetSalesEnabled default backfill...');
  const internetResult = await ListingModel.updateMany(
    { internetSalesEnabled: { $exists: false } },
    { $set: { internetSalesEnabled: false } },
  );
  console.log(`   → ${internetResult.modifiedCount} kayıt güncellendi.`);

  await mongoose.disconnect();
  console.log('Migration tamamlandı.');
}

main().catch((err) => {
  console.error('Migration hatası:', err);
  process.exit(1);
});