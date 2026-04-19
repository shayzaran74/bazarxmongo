import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const JSON_PATH = path.resolve(__dirname, './trendyol_hierarchy_v2.json')

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

async function upsertHierarchicalCategories(categories, parentId = null, surplusParentId = null, slugPath = '', namePath = '') {
    for (const cat of categories) {
        const currentSlug = slugify(cat.name)
        if (!currentSlug) continue;

        const fullSlug = slugPath ? `${slugPath}-${currentSlug}` : currentSlug
        const fullName = namePath ? `${namePath} > ${cat.name}` : cat.name

        // Main Category Table
        const created = await prisma.category.upsert({
            where: { slug: fullSlug },
            update: {
                name: cat.name,
                parentId: parentId,
                isActive: true,
                type: 'GENERAL',
                colorFrom: 'from-blue-400',
                colorTo: 'to-amber-500',
                hoverColor: 'group-hover:text-gray-600',
                shadowColor: 'shadow-gray-200'
            },
            create: {
                name: cat.name,
                slug: fullSlug,
                parentId: parentId,
                isActive: true,
                type: 'GENERAL',
                colorFrom: 'from-blue-400',
                colorTo: 'to-amber-500',
                hoverColor: 'group-hover:text-gray-600',
                shadowColor: 'shadow-gray-200'
            }
        })

        // Surplus Category Table (Using fullName as the name is unique)
        const createdSurplus = await prisma.surplusCategory.upsert({
            where: { name: fullName },
            update: {
                slug: fullSlug,
                parentId: surplusParentId,
                isActive: true
            },
            create: {
                name: fullName,
                slug: fullSlug,
                parentId: surplusParentId,
                isActive: true
            }
        })

        if (cat.children && cat.children.length > 0) {
            await upsertHierarchicalCategories(cat.children, created.id, createdSurplus.id, fullSlug, fullName)
        }
    }
}

async function main() {
    if (!fs.existsSync(JSON_PATH)) {
        console.error(`❌ JSON file not found at: ${JSON_PATH}`)
        process.exit(1)
    }

    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
    console.log(`🚀 Starting Trendyol category seeding process...`)

    await upsertHierarchicalCategories(data)

    console.log('✅ Seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
