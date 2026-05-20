// seed-brands-mongo.js — Prisma seed-brands.js'nin MongoDB karşılığı
// marka.json dosyasındaki tüm markaları Brand koleksiyonuna yükler
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Brand } from '../../packages/shared/shared-persistence/src/schemas/backend/brand.schema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JSON_PATH = path.resolve(__dirname, './marka.json');

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

async function main() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`❌ JSON dosyası bulunamadı: ${JSON_PATH}`);
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlantısı kuruldu');

  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  console.log(`🚀 Marka seed başlıyor (${data.length} marka)...`);

  const BATCH_SIZE = 100;
  let processed = 0;
  let inserted = 0;

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    for (const brand of batch) {
      const slug = slugify(brand.name);
      if (!slug) continue;

      // Slug çakışmasını önlemek için fallback
      let finalSlug = slug;
      const existing = await Brand.findOne({ slug }).lean();
      if (existing && existing.name !== brand.name) {
        finalSlug = `${slug}-${processed}`;
      }

      const id = new mongoose.Types.ObjectId().toString();
      await Brand.findOneAndUpdate(
        { name: brand.name },
        {
          $set: { slug: finalSlug, status: 'APPROVED' },
          $setOnInsert: { _id: id, id }
        },
        { upsert: true }
      );
      inserted++;
    }
    processed = Math.min(i + BATCH_SIZE, data.length);
    console.log(`✅ İşlendi: ${processed} / ${data.length}`);
  }

  console.log(`\n🎉 Marka seed tamamlandı! Toplam: ${inserted} marka`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Hata:', err);
  process.exit(1);
});
