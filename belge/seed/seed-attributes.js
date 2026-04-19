import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Seed data start: Category Attributes...')

    // 1. Get some categories
    const categories = await prisma.category.findMany({ take: 10 })
    const surplusCategories = await prisma.surplusCategory.findMany({ take: 10 })

    if (categories.length === 0 || surplusCategories.length === 0) {
        console.error('No categories found. Please seed categories first.')
        return
    }

    // Find "Elektronik" or similar for product categories
    const electronics = categories.find(c => c.name.toLowerCase().includes('elektronik') || c.name.toLowerCase().includes('telefon')) || categories[0]

    // Find "Metal" or similar for surplus categories
    const metal = surplusCategories.find(c => c.name.toLowerCase().includes('metal')) || surplusCategories[0]

    console.log(`Adding attributes to Product Category: ${electronics.name} (${electronics.id})`)
    console.log(`Adding attributes to Surplus Category: ${metal.name} (${metal.id})`)

    // Clear existing for these categories to avoid dupes
    await prisma.categoryAttribute.deleteMany({
        where: {
            OR: [
                { categoryId: electronics.id },
                { surplusCategoryId: metal.id }
            ]
        }
    })

    // Product Category Attributes (Electronics Example)
    await prisma.categoryAttribute.createMany({
        data: [
            {
                categoryId: electronics.id,
                name: 'brand_model',
                label: 'Marka ve Model',
                type: 'text',
                isRequired: true,
                order: 1
            },
            {
                categoryId: electronics.id,
                name: 'ram_capacity',
                label: 'RAM Kapasitesi',
                type: 'select',
                options: ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB'],
                unit: 'GB',
                isRequired: true,
                order: 2
            },
            {
                categoryId: electronics.id,
                name: 'color',
                label: 'Renk',
                type: 'select',
                options: ['Siyah', 'Beyaz', 'Gümüş', 'Mavi', 'Kırmızı'],
                isVariant: true,
                order: 3
            },
            {
                categoryId: electronics.id,
                name: 'warranty_period',
                label: 'Garanti Süresi',
                type: 'number',
                unit: 'Ay',
                placeholder: '24',
                order: 4
            }
        ]
    })

    // Surplus Category Attributes (Metal Example)
    await prisma.categoryAttribute.createMany({
        data: [
            {
                surplusCategoryId: metal.id,
                name: 'alloy_type',
                label: 'Alaşım Tipi',
                type: 'select',
                options: ['Alüminyum 6061', 'Alüminyum 7075', 'Paslanmaz Çelik 304', 'Paslanmaz Çelik 316', 'Lama Bakır'],
                isRequired: true,
                order: 1
            },
            {
                surplusCategoryId: metal.id,
                name: 'thickness',
                label: 'Kalınlık (mm)',
                type: 'number',
                unit: 'mm',
                isRequired: true,
                order: 2
            },
            {
                surplusCategoryId: metal.id,
                name: 'hardness_hrc',
                label: 'Sertlik (HRC)',
                type: 'number',
                unit: 'HRC',
                order: 3
            },
            {
                surplusCategoryId: metal.id,
                name: 'certificate_available',
                label: 'Malzeme Sertifikası Mevcut',
                type: 'checkbox',
                order: 4
            }
        ]
    })

    console.log('Seed data finished successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
