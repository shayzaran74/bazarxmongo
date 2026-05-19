import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Brand } from '../../packages/shared/shared-persistence/src/schemas/backend/brand.schema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';
const JSON_PATH = path.resolve(__dirname, './marka.json');

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
        console.error(`❌ JSON file not found at: ${JSON_PATH}`);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
    console.log(`🚀 Starting Brand seeding process (${data.length} brands)...`);

    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const BATCH_SIZE = 100;
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);

            for (const brand of batch) {
                const slug = slugify(brand.name);
                if (!slug) continue;

                await Brand.findOneAndUpdate(
                    { name: brand.name },
                    {
                        $set: {
                            name: brand.name,
                            slug: slug,
                            status: 'APPROVED'
                        }
                    },
                    { upsert: true }
                );
            }

            console.log(`✅ Processed ${Math.min(i + BATCH_SIZE, data.length)} / ${data.length} brands`);
        }

        console.log('🎉 Brand seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

main();
