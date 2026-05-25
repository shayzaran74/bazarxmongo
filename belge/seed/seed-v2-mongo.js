// seed-v2-mongo.js — Prisma seed-v2.js + seed-comprehensive.js + seed-test-user.js MongoDB karşılığı
// Admin, satıcı ve müşteri kullanıcılarını, şirketleri, vendor profillerini ve örnek ürün/ilanı seed'ler
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../../packages/shared/shared-persistence/src/schemas/backend/user.schema.ts';
import { UserProfile } from '../../packages/shared/shared-persistence/src/schemas/backend/userProfile.schema.ts';
import { Company } from '../../packages/shared/shared-persistence/src/schemas/backend/company.schema.ts';
import { Vendor } from '../../packages/shared/shared-persistence/src/schemas/backend/vendor.schema.ts';
import { Category } from '../../packages/shared/shared-persistence/src/schemas/backend/category.schema.ts';
import { CatalogProduct } from '../../packages/shared/shared-persistence/src/schemas/backend/catalogProduct.schema.ts';
import { Listing } from '../../packages/shared/shared-persistence/src/schemas/backend/listing.schema.ts';
import { Wallet } from '../../packages/shared/shared-persistence/src/schemas/financial/wallet.schema.ts';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

function genId() { return new mongoose.Types.ObjectId().toString(); }

function slugify(text) {
  return text.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[ıİ]/g, 'i').replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u').replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o').replace(/[çÇ]/g, 'c')
    .replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').trim();
}

const USERS = [
  { email: 'admin@barterborsa.com',   firstName: 'Admin',  lastName: 'User',       role: 'SUPER_ADMIN', platform: 'BAZARX' },
  { email: 'seller1@barterborsa.com', firstName: 'Elite',  lastName: 'Merchant 1', role: 'VENDOR',      platform: 'BAZARX' },
  { email: 'seller2@barterborsa.com', firstName: 'Elite',  lastName: 'Merchant 2', role: 'VENDOR',      platform: 'BAZARX' },
  { email: 'customer1@barterborsa.com',firstName:'VIP',    lastName: 'Buyer 1',    role: 'USER',        platform: 'BAZARX' },
  { email: 'customer2@barterborsa.com',firstName:'VIP',    lastName: 'Buyer 2',    role: 'USER',        platform: 'BAZARX' },
  { email: 'customer3@barterborsa.com',firstName:'VIP',    lastName: 'Buyer 3',    role: 'USER',        platform: 'BAZARX' },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlantısı kuruldu\n');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ─── USERS ────────────────────────────────────────────────────────────────
  console.log('👤 Kullanıcılar oluşturuluyor...');
  const userMap = {};

  for (const u of USERS) {
    const uid = genId();
    const user = await User.findOneAndUpdate(
      { email: u.email },
      {
        $set: { role: u.role, status: 'ACTIVE', isEmailVerified: true, platform: u.platform },
        $setOnInsert: { _id: uid, id: uid, email: u.email, password: hashedPassword }
      },
      { upsert: true, new: true }
    );
    userMap[u.email] = user;

    // Profile
    const profId = genId();
    await UserProfile.findOneAndUpdate(
      { userId: user.id || uid },
      {
        $set: { firstName: u.firstName, lastName: u.lastName },
        $setOnInsert: { _id: profId, id: profId, userId: user.id || uid }
      },
      { upsert: true }
    );

    // Wallet
    const walletId = genId();
    await Wallet.findOneAndUpdate(
      { userId: user.id || uid },
      { $setOnInsert: { _id: walletId, id: walletId, userId: user.id || uid, balance: 100000, currency: 'TRY' } },
      { upsert: true }
    );

    console.log(`  ✅ ${u.email} [${u.role}]`);
  }

  // ─── COMPANIES & VENDORS ──────────────────────────────────────────────────
  console.log('\n🏢 Şirket ve Vendor verileri oluşturuluyor...');
  const vendorUsers = USERS.filter(u => u.role === 'VENDOR');

  for (const u of vendorUsers) {
    const user = userMap[u.email];
    const userId = user?.id || user?._id?.toString();
    if (!userId) continue;

    const companyName = `${u.firstName} ${u.lastName} A.Ş.`;
    const taxNumber = `TAX-${u.email.split('@')[0].toUpperCase()}`;
    const cid = genId();

    const company = await Company.findOneAndUpdate(
      { taxNumber },
      {
        $set: { name: companyName, status: 'APPROVED', verifiedAt: new Date() },
        $setOnInsert: { _id: cid, id: cid, taxNumber }
      },
      { upsert: true, new: true }
    );

    const companyId = company?.id || cid;
    const vendorSlug = slugify(`${u.firstName}-${u.lastName}`);
    const vid = genId();

    await Vendor.findOneAndUpdate(
      { userId },
      {
        $set: {
          companyId, slug: vendorSlug, status: 'APPROVED',
          tier: 'ELITE', isVerified: true, barterEnabled: true, vendorType: 'COMMERCE'
        },
        $setOnInsert: { _id: vid, id: vid, userId }
      },
      { upsert: true }
    );

    console.log(`  ✅ Vendor: ${companyName}`);
  }

  // ─── CATEGORY & PRODUCT & LISTING ─────────────────────────────────────────
  console.log('\n📦 Örnek ürün ve ilan oluşturuluyor...');

  // Elektronik kategorisi
  const catId = genId();
  const category = await Category.findOneAndUpdate(
    { slug: 'electronic' },
    {
      $set: { name: 'Electronics', isActive: true, type: 'GENERAL' },
      $setOnInsert: { _id: catId, id: catId, slug: 'electronic', order: 0, isFeatured: false }
    },
    { upsert: true, new: true }
  );
  const categoryId = category?.id || catId;

  // Örnek ürün
  const prodId = genId();
  const product = await CatalogProduct.findOneAndUpdate(
    { slug: 'industrial-lathe-m1' },
    {
      $set: { name: 'Industrial Lathe M1', brand: 'SanayiGlobal', categoryId, status: 'ACTIVE', isFeatured: true },
      $setOnInsert: { _id: prodId, id: prodId, slug: 'industrial-lathe-m1', rating: 0 }
    },
    { upsert: true, new: true }
  );
  const catalogProductId = product?.id || prodId;

  // Seller1 vendor'ını bul
  const seller1 = userMap['seller1@barterborsa.com'];
  const seller1Id = seller1?.id || seller1?._id?.toString();
  const vendor1 = seller1Id ? await Vendor.findOne({ userId: seller1Id }).lean() : null;

  if (vendor1) {
    const lstId = genId();
    await Listing.findOneAndUpdate(
      { slug: 'lathe-m1-seller1' },
      {
        $set: { catalogProductId, vendorId: vendor1.id, price: 150000, stock: 5, status: 'ACTIVE' },
        $setOnInsert: { _id: lstId, id: lstId, slug: 'lathe-m1-seller1', condition: 'NEW', sku: 'LATHE-M1-S1' }
      },
      { upsert: true }
    );
    console.log('  ✅ Örnek listing oluşturuldu: lathe-m1-seller1');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Master Seeding tamamlandı!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin    : admin@barterborsa.com / password123');
  console.log('Satıcılar: seller1@ / seller2@ / password123');
  console.log('Müşteri  : customer1-3@ / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Hata:', err);
  process.exit(1);
});
