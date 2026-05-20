// belge/seed/seed-tier-benefits-mongo.js
// B2B TierBenefit konfigürasyonlarını seed'ler (CORE / PRIME / ELITE / APEX)
// ve mevcut vendor'lara tier ataması yapar.
// Kaynak: barter-rules.md §3, vendor.schema.ts

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

function genId() { return new mongoose.Types.ObjectId().toString(); }

// ─── Tier Benefit şeması (local — import kullanmadan) ────────────────────────
const TierBenefitSchema = new mongoose.Schema({
  id:                  { type: String, required: true },
  tier:                { type: String, enum: ['CORE', 'PRIME', 'ELITE', 'APEX'], required: true },
  annualFee:           { type: mongoose.Types.Decimal128 },
  apiRatePerMin:       { type: Number },
  archiveAfterDays:    { type: Number },
  burnRate:            { type: mongoose.Types.Decimal128 },
  commissionBarter:    { type: mongoose.Types.Decimal128 },
  commissionCash:      { type: mongoose.Types.Decimal128 },
  excelBatchLimit:     { type: Number },
  imageCountPerListing:{ type: Number },
  listingLimit:        { type: Number },
  roiRate:             { type: mongoose.Types.Decimal128 },
  xpMultiplier:        { type: mongoose.Types.Decimal128 },
}, { timestamps: true, collection: 'tier_benefits' });

TierBenefitSchema.index({ tier: 1 }, { unique: true });

const TierBenefit = mongoose.models.TierBenefit
  ?? mongoose.model('TierBenefit', TierBenefitSchema);

// ─── Vendor şeması (tier güncellemesi için minimal) ──────────────────────────
const VendorSchema = new mongoose.Schema({
  id:   { type: String },
  tier: { type: String, enum: ['CORE', 'PRIME', 'ELITE', 'APEX'], default: 'CORE' },
}, { strict: false, collection: 'vendors' });

const Vendor = mongoose.models.Vendor
  ?? mongoose.model('Vendor', VendorSchema);

// ─── Tier konfigürasyonları (barter-rules.md §3 ile senkronize) ──────────────
const D = (v) => mongoose.Types.Decimal128.fromString(String(v));

const TIER_CONFIGS = [
  {
    tier:                'CORE',
    // %12 komisyon — 150.000 TL havuz limiti — 12.000 TL yıllık
    commissionCash:      D(0.12),
    commissionBarter:    D(0.12),
    annualFee:           D(12000),
    burnRate:            D(0.50),
    listingLimit:        100,
    apiRatePerMin:       60,
    excelBatchLimit:     50,
    archiveAfterDays:    365,
    imageCountPerListing:5,
    roiRate:             D(0.50),
    xpMultiplier:        D(1.0),
  },
  {
    tier:                'PRIME',
    // %10 komisyon — 500.000 TL havuz limiti — 48.000 TL yıllık
    commissionCash:      D(0.10),
    commissionBarter:    D(0.10),
    annualFee:           D(48000),
    burnRate:            D(0.60),
    listingLimit:        500,
    apiRatePerMin:       120,
    excelBatchLimit:     200,
    archiveAfterDays:    365,
    imageCountPerListing:8,
    roiRate:             D(0.65),
    xpMultiplier:        D(1.3),
  },
  {
    tier:                'ELITE',
    // %8 komisyon — 1.500.000 TL havuz limiti — 120.000 TL yıllık
    commissionCash:      D(0.08),
    commissionBarter:    D(0.08),
    annualFee:           D(120000),
    burnRate:            D(0.70),
    listingLimit:        2000,
    apiRatePerMin:       300,
    excelBatchLimit:     1000,
    archiveAfterDays:    730,
    imageCountPerListing:12,
    roiRate:             D(0.85),
    xpMultiplier:        D(1.5),
  },
  {
    tier:                'APEX',
    // %6 komisyon — sınırsız havuz — 300.000 TL yıllık
    commissionCash:      D(0.06),
    commissionBarter:    D(0.06),
    annualFee:           D(300000),
    burnRate:            D(0.80),
    listingLimit:        99999,
    apiRatePerMin:       1000,
    excelBatchLimit:     99999,
    archiveAfterDays:    730,
    imageCountPerListing:20,
    roiRate:             D(1.00),
    xpMultiplier:        D(2.0),
  },
];

// ─── Ana fonksiyon ───────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlantısı kuruldu\n');

  // 1. Tier benefit konfigürasyonlarını upsert et
  console.log('📦 TierBenefit konfigürasyonları yazılıyor...');
  for (const cfg of TIER_CONFIGS) {
    const newId = genId();
    const result = await TierBenefit.findOneAndUpdate(
      { tier: cfg.tier },
      {
        $set: cfg,
        $setOnInsert: { _id: newId, id: newId },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`  ✓ ${cfg.tier} — id: ${result.id}`);
  }

  // 2. Tier alanı eksik olan vendor'ları CORE ile güncelle
  console.log('\n👥 Tier ataması olmayan vendor\'lar kontrol ediliyor...');
  const noTierResult = await Vendor.updateMany(
    { $or: [{ tier: { $exists: false } }, { tier: null }, { tier: '' }] },
    { $set: { tier: 'CORE' } },
  );
  console.log(`  ✓ ${noTierResult.modifiedCount} vendor'a CORE tier atandı`);

  // 3. Geçersiz tier değeri olan vendor'ları CORE'a çek
  const invalidTierResult = await Vendor.updateMany(
    { tier: { $nin: ['CORE', 'PRIME', 'ELITE', 'APEX'] } },
    { $set: { tier: 'CORE' } },
  );
  console.log(`  ✓ ${invalidTierResult.modifiedCount} geçersiz tier → CORE düzeltildi`);

  // 4. Özet rapor
  console.log('\n📊 Tier Dağılımı:');
  for (const t of ['CORE', 'PRIME', 'ELITE', 'APEX']) {
    const count = await Vendor.countDocuments({ tier: t });
    console.log(`  ${t.padEnd(6)}: ${count} vendor`);
  }

  await mongoose.disconnect();
  console.log('\n🎉 Tier seed tamamlandı.');
}

main().catch((err) => {
  console.error('❌ Seed hatası:', err);
  process.exit(1);
});
