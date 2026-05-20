// seed-trendyol-categories-mongo.js — Prisma seed-trendyol-categories.js'nin MongoDB karşılığı
// trendyol_hierarchy_v2.json'daki kategori ağacını Category koleksiyonuna hiyerarşik olarak yükler
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Category } from '../../packages/shared/shared-persistence/src/schemas/backend/category.schema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JSON_PATH = path.resolve(__dirname, './trendyol_hierarchy_v2.json');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

function slugify(text) {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ /g, '-')
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .trim();
}

let insertCount = 0;

async function upsertHierarchicalCategories(categories, parentId = null, slugPath = '') {
  for (const cat of categories) {
    const currentSlug = slugify(cat.name);
    if (!currentSlug) continue;

    const fullSlug = slugPath ? `${slugPath}-${currentSlug}` : currentSlug;

    const catData = {
      name: cat.name,
      slug: fullSlug,
      parentId: parentId,
      isActive: true,
      type: 'GENERAL',
      colorFrom: 'from-blue-400',
      colorTo: 'to-amber-500',
      hoverColor: 'group-hover:text-gray-600',
      shadowColor: 'shadow-gray-200',
      order: 0,
      isFeatured: false,
    };

    // id olarak slug kullan (kategori ID'leri zaten slug bazlı migrate edildi)
    const created = await Category.findOneAndUpdate(
      { slug: fullSlug },
      {
        $set: catData,
        $setOnInsert: { _id: new mongoose.Types.ObjectId().toString(), id: fullSlug }
      },
      { upsert: true, new: true }
    );

    insertCount++;

    if (cat.children && cat.children.length > 0) {
      await upsertHierarchicalCategories(cat.children, created.id || fullSlug, fullSlug);
    }
  }
}

async function main() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`❌ JSON dosyası bulunamadı: ${JSON_PATH}`);
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlantısı kuruldu');

  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  console.log(`🚀 Trendyol kategori hiyerarşisi yükleniyor...`);
  console.log(`   Üst seviye kategori sayısı: ${data.length}`);

  await upsertHierarchicalCategories(data);

  console.log(`\n🎉 Trendyol kategori seed tamamlandı!`);
  console.log(`   Toplam işlenen: ${insertCount} kategori`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Hata:', err);
  process.exit(1);
});
