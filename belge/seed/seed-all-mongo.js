import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seeders = [
    { name: 'Master Data (V2 + Users + Vendors)', path: './seed-v2-mongo.js' },
    { name: 'Trendyol Kategori Hiyerarşisi',      path: './seed-trendyol-categories-mongo.js' },
    { name: 'Barter Kategorileri',                 path: './seed-barter-categories-mongo.js' },
    { name: 'Markalar (marka.json)',                path: './seed-brands-mongo.js' },
    { name: 'Kategori Özellikleri (Attributes)',    path: './seed-attributes-mongo.js' },
    { name: 'Rozet Kuralları (Badges)',             path: './seed-badges-mongo.js' },
    { name: 'Yardım Merkezi (Tam)',                path: './seed-help-full-mongo.js' },
    { name: 'İçerik (Duyurular + Politikalar)',    path: './seed-content-mongo.js' },
];

async function runSeeders() {
    console.log('🚀 Starting Master Seeding Process (MongoDB)...');
    console.log('------------------------------------');

    for (const seeder of seeders) {
        const fullPath = path.resolve(__dirname, seeder.path);
        console.log(`\n⏳ Running: ${seeder.name}...`);

        try {
            execSync(`npx tsx ${fullPath}`, { 
                stdio: 'inherit',
                env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` }
            });
            console.log(`✅ Completed: ${seeder.name}`);
        } catch (error) {
            console.error(`❌ Error in ${seeder.name}:`);
            console.error(error.message);
            // Stop if any core seeder fails
            process.exit(1);
        }
    }

    console.log('\n⏳ Clearing Redis Cache...');
    try {
        execSync('redis-cli -p 6380 flushall', { stdio: 'inherit' });
        console.log('✅ Cache cleared successfully');
    } catch (error) {
        console.warn('⚠️ Could not clear Redis cache automatically. You may need to run "redis-cli -p 6380 flushall" manually.');
    }

    console.log('\n------------------------------------');
    console.log('🎉 Master Seeding Process Finished!');
}

runSeeders();
