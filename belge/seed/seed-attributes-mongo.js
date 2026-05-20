// seed-attributes-mongo.js — Prisma seed-attributes.js'nin MongoDB karşılığı
// Kategori bazlı CategoryAttribute'ları MongoDB'ye yükler
import mongoose from 'mongoose';
import { Category } from '../../packages/shared/shared-persistence/src/schemas/backend/category.schema.ts';
import { CategoryAttribute } from '../../packages/shared/shared-persistence/src/schemas/backend/categoryAttribute.schema.ts';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

function genId() {
  return new mongoose.Types.ObjectId().toString();
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlantısı kuruldu');

  // Elektronik kategorisini bul
  const electronics = await Category.findOne({
    $or: [
      { slug: { $regex: 'elektronik|telefon|electronic', $options: 'i' } },
      { name: { $regex: 'elektronik|telefon|electronic', $options: 'i' } }
    ],
    parentId: { $in: [null, undefined] }
  }).lean();

  if (!electronics) {
    console.warn('⚠️ Elektronik kategorisi bulunamadı, ilk kategori kullanılıyor...');
  }

  const targetCategory = electronics || await Category.findOne().lean();

  if (!targetCategory) {
    console.error('❌ Hiç kategori bulunamadı. Önce kategori seed çalıştırın.');
    process.exit(1);
  }

  console.log(`📂 Hedef kategori: ${targetCategory.name} (${targetCategory.id || targetCategory._id})`);

  const categoryId = targetCategory.id || targetCategory._id?.toString();

  // Mevcut attribute'ları temizle
  await CategoryAttribute.deleteMany({ categoryId });

  const attributes = [
    {
      name: 'brand_model',
      label: 'Marka ve Model',
      type: 'text',
      isRequired: true,
      order: 1,
    },
    {
      name: 'ram_capacity',
      label: 'RAM Kapasitesi',
      type: 'select',
      options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB'],
      unit: 'GB',
      isRequired: true,
      order: 2,
    },
    {
      name: 'color',
      label: 'Renk',
      type: 'select',
      options: ['Siyah', 'Beyaz', 'Gümüş', 'Mavi', 'Kırmızı'],
      isVariant: true,
      order: 3,
    },
    {
      name: 'warranty_period',
      label: 'Garanti Süresi',
      type: 'number',
      unit: 'Ay',
      placeholder: '24',
      order: 4,
    },
    {
      name: 'storage',
      label: 'Depolama Kapasitesi',
      type: 'select',
      options: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'],
      unit: 'GB',
      isVariant: true,
      order: 5,
    },
  ];

  let count = 0;
  for (const attr of attributes) {
    const id = genId();
    await CategoryAttribute.findOneAndUpdate(
      { categoryId, name: attr.name },
      { $set: { ...attr, categoryId }, $setOnInsert: { _id: id, id } },
      { upsert: true }
    );
    count++;
  }

  console.log(`✅ ${count} kategori özelliği eklendi (Kategori: ${targetCategory.name})`);
  console.log('\n🎉 Attribute seed tamamlandı!');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Hata:', err);
  process.exit(1);
});
