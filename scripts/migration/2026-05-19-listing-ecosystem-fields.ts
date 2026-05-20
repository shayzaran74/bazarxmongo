// scripts/migration/2026-05-19-listing-ecosystem-fields.ts
// Master Plan v4.3 §4.2 — Mevcut listing kayıtlarına fabrika ekosistemi alanları için default backfill.
// Çalıştırma: pnpm ts-node scripts/migration/2026-05-19-listing-ecosystem-fields.ts
//
// Etki:
//   - visibleTo = 'NONE' (eksik tüm kayıtlara)
//   - allowOnlineResale = false (eksik tüm kayıtlara)
//   - selectedDealerIds = [] (eksik tüm kayıtlara)
//   - maxOrderQtyPerDealer: SADECE ecosystemId olan kayıtlar için ADMIN MANUEL set etmelidir.
//     Script bu durumda uyarı raporu basar; backfill yapmaz.

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

  console.log('1) Genel default backfill başlıyor...');
  const generalResult = await ListingModel.updateMany(
    {
      $or: [
        { visibleTo: { $exists: false } },
        { allowOnlineResale: { $exists: false } },
        { selectedDealerIds: { $exists: false } },
      ],
    },
    {
      $set: {
        visibleTo: 'NONE',
        allowOnlineResale: false,
        selectedDealerIds: [],
      },
    },
  );
  console.log(`   → ${generalResult.modifiedCount} kayıt güncellendi.`);

  console.log('2) Ekosistem listing\'lerinde eksik maxOrderQtyPerDealer kontrolü...');
  const missingQty = await ListingModel.find({
    ecosystemId: { $exists: true, $ne: null },
    $or: [
      { maxOrderQtyPerDealer: { $exists: false } },
      { maxOrderQtyPerDealer: null },
    ],
  }, { id: 1, vendorId: 1, ecosystemId: 1, title: 1 }).lean();

  if (missingQty.length > 0) {
    console.warn(`   ⚠ ${missingQty.length} ekosistem listing'i maxOrderQtyPerDealer eksik. Admin manuel olarak set etmelidir:`);
    for (const l of missingQty) {
      console.warn(`     - ${l.id} | ecosystem=${l.ecosystemId} | "${l.title}"`);
    }
  } else {
    console.log('   ✓ Tüm ekosistem listing\'lerinde maxOrderQtyPerDealer mevcut.');
  }

  await mongoose.disconnect();
  console.log('Migration tamamlandı.');
}

main().catch((err) => {
  console.error('Migration hatası:', err);
  process.exit(1);
});
