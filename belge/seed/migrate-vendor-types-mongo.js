// belge/seed/migrate-vendor-types-mongo.js
// Mevcut restoran vendor'larının vendorType alanını RESTAURANT olarak günceller.
// Tanımlama kriteri: VendorProfile.cuisineType alanı dolu olan vendor'lar

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI
  || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

const VendorProfileSchema = new mongoose.Schema({
  id:          { type: String },
  vendorId:    { type: String },
  cuisineType: { type: String },
  storeName:   { type: String },
}, { strict: false, collection: 'vendor_profiles' });

const VendorSchema = new mongoose.Schema({
  id:         { type: String },
  vendorType: { type: String, default: 'COMMERCE' },
}, { strict: false, collection: 'vendors' });

const VendorProfile = mongoose.models.VendorProfile
  ?? mongoose.model('VendorProfile', VendorProfileSchema);

const Vendor = mongoose.models.Vendor
  ?? mongoose.model('Vendor', VendorSchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlantısı kuruldu\n');

  // 1. cuisineType'ı dolu olan vendor profilleri bul
  const restaurantProfiles = await VendorProfile.find(
    { cuisineType: { $exists: true, $ne: null, $ne: '' } },
    { vendorId: 1, storeName: 1, cuisineType: 1 }
  ).lean();

  console.log(`🍽️  ${restaurantProfiles.length} restoran profili bulundu\n`);

  let updated = 0;
  let skipped = 0;

  for (const profile of restaurantProfiles) {
    const vendorId = profile.vendorId;
    if (!vendorId) { skipped++; continue; }

    const result = await Vendor.updateOne(
      { id: vendorId, vendorType: { $ne: 'RESTAURANT' } },
      { $set: { vendorType: 'RESTAURANT' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`  ✓ ${profile.storeName || vendorId} → RESTAURANT (${profile.cuisineType})`);
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\n📊 Sonuç: ${updated} vendor RESTAURANT'a güncellendi, ${skipped} atlandı`);

  // 2. Sonuç doğrulama
  const restaurantCount = await Vendor.countDocuments({ vendorType: 'RESTAURANT' });
  const commerceCount   = await Vendor.countDocuments({ vendorType: 'COMMERCE' });
  console.log(`\n   RESTAURANT: ${restaurantCount} vendor`);
  console.log(`   COMMERCE:   ${commerceCount} vendor`);

  await mongoose.disconnect();
  console.log('\n🎉 Migration tamamlandı.');
}

main().catch(err => {
  console.error('❌ Migration hatası:', err);
  process.exit(1);
});
