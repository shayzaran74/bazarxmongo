import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const JSON_PATH = path.resolve(__dirname, './marka.json')

function slugify(text) {
    if (!text) return ''
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
        .trim()
}

async function main() {
    if (!fs.existsSync(JSON_PATH)) {
        console.error(`❌ JSON file not found at: ${JSON_PATH}`)
        process.exit(1)
    }

    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
    console.log(`🚀 Starting Brand seeding process (${data.length} brands)...`)

    // Processing in smaller batches to avoid memory issues and connection timeouts
    const BATCH_SIZE = 100
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE)

        for (const brand of batch) {
            const slug = slugify(brand.name)
            if (!slug) continue

            try {
                await prisma.brand.upsert({
                    where: { name: brand.name },
                    update: {
                        slug: slug,
                        status: 'APPROVED'
                    },
                    create: {
                        name: brand.name,
                        slug: slug,
                        status: 'APPROVED'
                    }
                })
            } catch (error) {
                if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
                    const uniqueSlug = `${slug}-${brand.id}`
                    await prisma.brand.upsert({
                        where: { name: brand.name },
                        update: { slug: uniqueSlug, status: 'APPROVED' },
                        create: { name: brand.name, slug: uniqueSlug, status: 'APPROVED' }
                    })
                }
            }
        }

        console.log(`✅ Processed ${Math.min(i + BATCH_SIZE, data.length)} / ${data.length} brands`)
    }

    console.log('🎉 Brand seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
