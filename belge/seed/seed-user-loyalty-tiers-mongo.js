// belge/seed/seed-user-loyalty-tiers-mongo.js
// 1. membership_tiers — BRONZE/SILVER/GOLD/PLATINUM/DIAMOND XP eşiklerini seed'ler
// 2. user_levels      — Mevcut her kullanıcı için başlangıç XP kaydı oluşturur (upsert)
// Kaynak: loyalty.enums.ts, userLevel.schema.ts, membershipTier.schema.ts

import mongoose from 'mongoose';

const MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

function genId() { return new mongoose.Types.ObjectId().toString(); }
const D = (v) => mongoose.Types.Decimal128.fromString(String(v));

// ─── Şemalar (local — dışa bağımlılık yok) ──────────────────────────────────

const MembershipTierSchema = new mongoose.Schema({
  id:               { type: String, required: true },
  tier:             { type: String, enum: ['BRONZE','SILVER','GOLD','PLATINUM','DIAMOND'] },
  minXp:            { type: Number },
  description:      { type: String },
  rewardMultiplier: { type: mongoose.Types.Decimal128, default: 1.0 },
  benefitMetadata:  { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true, collection: 'membership_tiers' });
MembershipTierSchema.index({ tier: 1 }, { unique: true });

const UserLevelSchema = new mongoose.Schema({
  id:               { type: String, required: true },
  userId:           { type: String },
  currentXp:        { type: Number, default: 0 },
  lifetimeXp:       { type: Number, default: 0 },
  level:            { type: Number, default: 1 },
  tierId:           { type: String },
  isFirstOrder:     { type: Boolean, default: true },
  lastLoginBonusAt: { type: Date },
}, { timestamps: true, collection: 'user_levels' });
UserLevelSchema.index({ userId: 1 }, { unique: true });

const UserSchema = new mongoose.Schema({
  id:     { type: String },
  email:  { type: String },
  role:   { type: String },
  status: { type: String },
}, { strict: false, collection: 'users' });

const MembershipTier = mongoose.models.MembershipTier
  ?? mongoose.model('MembershipTier', MembershipTierSchema);

const UserLevel = mongoose.models.UserLevel
  ?? mongoose.model('UserLevel', UserLevelSchema);

const User = mongoose.models.User
  ?? mongoose.model('User', UserSchema);

// ─── Tier tanımları (XP eşikleri + çarpanlar) ────────────────────────────────
// Formül: bir üst tier'a geçmek için gereken minXp, standart alışverişle
// yaklaşık 3-6 ayda ulaşılabilecek şekilde tasarlandı.
const LOYALTY_TIERS = [
  {
    tier:             'BRONZE',
    minXp:            0,
    description:      'Başlangıç seviyesi. Platforma yeni katılan kullanıcılar.',
    rewardMultiplier: D(1.0),
    benefitMetadata: {
      dailyLoginBonus:    10,
      orderXpRate:        0.05,   // sipariş tutarının %5'i XP
      barterXpRate:       0.08,
      maxDailyXp:         500,
      badgeSlots:         3,
    },
  },
  {
    tier:             'SILVER',
    minXp:            1_000,
    description:      'Aktif kullanıcı. Temel avantajlar ve artan XP kazanımı.',
    rewardMultiplier: D(1.25),
    benefitMetadata: {
      dailyLoginBonus:    25,
      orderXpRate:        0.07,
      barterXpRate:       0.10,
      maxDailyXp:         1_000,
      badgeSlots:         5,
      commissionDiscount: 0.01,  // %1 komisyon indirimi
    },
  },
  {
    tier:             'GOLD',
    minXp:            5_000,
    description:      'Sadık kullanıcı. Komisyon indirimi ve öncelikli destek.',
    rewardMultiplier: D(1.50),
    benefitMetadata: {
      dailyLoginBonus:    50,
      orderXpRate:        0.09,
      barterXpRate:       0.12,
      maxDailyXp:         2_000,
      badgeSlots:         8,
      commissionDiscount: 0.02,  // %2 komisyon indirimi
      prioritySupport:    true,
    },
  },
  {
    tier:             'PLATINUM',
    minXp:            15_000,
    description:      'Elit kullanıcı. Maksimum XP çarpanı ve özel ayrıcalıklar.',
    rewardMultiplier: D(1.75),
    benefitMetadata: {
      dailyLoginBonus:    100,
      orderXpRate:        0.11,
      barterXpRate:       0.15,
      maxDailyXp:         4_000,
      badgeSlots:         12,
      commissionDiscount: 0.03,  // %3 komisyon indirimi
      prioritySupport:    true,
      earlyAccess:        true,
    },
  },
  {
    tier:             'DIAMOND',
    minXp:            50_000,
    description:      'En üst seviye. Sınırsız ayrıcalıklar ve VIP statüsü.',
    rewardMultiplier: D(2.0),
    benefitMetadata: {
      dailyLoginBonus:    200,
      orderXpRate:        0.13,
      barterXpRate:       0.18,
      maxDailyXp:         10_000,
      badgeSlots:         20,
      commissionDiscount: 0.05,  // %5 komisyon indirimi
      prioritySupport:    true,
      earlyAccess:        true,
      vipManager:         true,
    },
  },
];

// ─── Ana fonksiyon ───────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlantısı kuruldu\n');

  // 1. membership_tiers — upsert
  console.log('🏆 Loyalty tier tanımları yazılıyor (membership_tiers)...');
  const tierIdMap = {};

  for (const cfg of LOYALTY_TIERS) {
    const newId = genId();
    const doc = await MembershipTier.findOneAndUpdate(
      { tier: cfg.tier },
      {
        $set: {
          minXp:            cfg.minXp,
          description:      cfg.description,
          rewardMultiplier: cfg.rewardMultiplier,
          benefitMetadata:  cfg.benefitMetadata,
        },
        $setOnInsert: { _id: newId, id: newId },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    tierIdMap[cfg.tier] = doc.id;
    console.log(`  ✓ ${cfg.tier.padEnd(9)} — minXp: ${String(cfg.minXp).padStart(6)} — id: ${doc.id}`);
  }

  // 2. Tüm kullanıcıları çek
  console.log('\n👥 Kullanıcılar için user_levels oluşturuluyor...');
  const users = await User.find({}, { id: 1, _id: 1, email: 1 }).lean();
  console.log(`  ${users.length} kullanıcı bulundu\n`);

  const bronzeId = tierIdMap['BRONZE'];
  let created = 0;
  let skipped = 0;

  for (const user of users) {
    const uid = user.id || user._id?.toString();
    if (!uid) { skipped++; continue; }

    const newId = genId();
    const result = await UserLevel.findOneAndUpdate(
      { userId: uid },
      {
        // Mevcut XP değerlerine dokunma — sadece eksik alanları doldur
        $setOnInsert: {
          _id:          newId,
          id:           newId,
          userId:       uid,
          currentXp:    0,
          lifetimeXp:   0,
          level:        1,
          tierId:       bronzeId,
          isFirstOrder: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (result.id === newId) {
      created++;
    } else {
      // Mevcut kayıt var — tierId eksikse BRONZE ata
      if (!result.tierId) {
        await UserLevel.updateOne({ userId: uid }, { $set: { tierId: bronzeId } });
      }
      skipped++;
    }
  }

  console.log(`  ✓ ${created} yeni user_level kaydı oluşturuldu`);
  console.log(`  ✓ ${skipped} mevcut kayıt atlandı (veriler korundu)`);

  // 3. Mevcut XP'ye göre tier güncellemesi
  console.log('\n📈 Mevcut XP\'lere göre tier senkronizasyonu...');
  const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const thresholds = LOYALTY_TIERS.map(t => ({ tier: t.tier, minXp: t.minXp, id: tierIdMap[t.tier] }));

  const allLevels = await UserLevel.find({}, { userId: 1, currentXp: 1, lifetimeXp: 1 }).lean();
  let upgraded = 0;

  for (const ul of allLevels) {
    const xp = Math.max(ul.currentXp ?? 0, ul.lifetimeXp ?? 0);
    // En yüksek eşiği geçen tier'ı bul
    const correctTier = [...thresholds].reverse().find(t => xp >= t.minXp) ?? thresholds[0];
    await UserLevel.updateOne(
      { userId: ul.userId, tierId: { $ne: correctTier.id } },
      { $set: { tierId: correctTier.id } },
    );
    upgraded++;
  }
  console.log(`  ✓ ${upgraded} kullanıcının tier senkronizasyonu tamamlandı`);

  // 4. Özet rapor
  console.log('\n📊 Loyalty Tier Dağılımı (user_levels):');
  for (const { tier, id } of thresholds) {
    const count = await UserLevel.countDocuments({ tierId: id });
    console.log(`  ${tier.padEnd(9)}: ${count} kullanıcı`);
  }

  await mongoose.disconnect();
  console.log('\n🎉 Loyalty tier seed tamamlandı.');
}

main().catch((err) => {
  console.error('❌ Seed hatası:', err);
  process.exit(1);
});
