import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seeders = [
    { name: 'Barter Categories', path: './seed-barter-categories.js' },
    { name: 'Trendyol Categories', path: './seed-trendyol-categories.js' },
    { name: 'Category Attributes', path: './seed-attributes.js' },
//    { name: 'Badge Rules', path: './seed-badges.js' },
    { name: 'Master Data (V2)', path: './seed-v2.js' },
    { name: 'Help Center', path: './seed-help.js' },
    { name: 'Legal Documents', path: './seed-legal.js' },
    { name: 'Dynamic Content', path: './seed-dynamic-content.js' },
    { name: 'Brands', path: './seed-brands.js' }
]

async function runSeeders() {
    console.log('🚀 Starting Master Seeding Process...')
    console.log('------------------------------------')

    for (const seeder of seeders) {
        const fullPath = path.resolve(__dirname, seeder.path)
        console.log(`\n⏳ Running: ${seeder.name}...`)

        try {
            execSync(`npx tsx ${fullPath}`, { 
                stdio: 'inherit',
                env: { ...process.env, PATH: `/usr/local/bin:${process.env.PATH}` }
            })
            console.log(`✅ Completed: ${seeder.name}`)
        } catch (error) {
            console.error(`❌ Error in ${seeder.name}:`)
            console.error(error.message)
            // Stop if any core seeder fails
            process.exit(1)
        }
    }

    console.log('\n⏳ Clearing Redis Cache...')
    try {
        execSync('redis-cli flushall', { stdio: 'inherit' })
        console.log('✅ Cache cleared successfully')
    } catch (error) {
        console.warn('⚠️ Could not clear Redis cache automatically. You may need to run "redis-cli flushall" manually.')
    }

    console.log('\n------------------------------------')
    console.log('🎉 Master Seeding Process Finished!')
}

runSeeders()
