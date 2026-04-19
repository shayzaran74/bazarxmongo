import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Seeding Welcome Pack Badge Rules...')

    const rules = [
        {
            code: 'FOMO_URGENT',
            displayText: { tr: '🔥 Kapış Kapış! (Son Ürünler)', en: '🔥 High Demand!' },
            position: 'BOTTOM_RIGHT',
            priority: 95,
            backgroundColor: '#ef4444', // Red-500
            textColor: '#ffffff',
            targetEcosystem: ['BAZARX'],
            conditionJson: {
                AND: [
                    { field: 'stock', operator: 'lt', value: 4 },
                    { field: 'soldCountLastHour', operator: 'gt', value: 5 }
                ]
            },
            isActive: true
        },
        {
            code: 'ELITE_EXCLUSIVE',
            displayText: { tr: '👑 Apex & Elite Özel', en: '👑 Elite Exclusive' },
            position: 'TOP_LEFT',
            priority: 100,
            backgroundColor: '#111827', // Gray-900 (Black)
            textColor: '#facc15', // Yellow-400 (Gold)
            targetEcosystem: ['TICARI_TAKAS', 'BARTER_BORSA'],
            conditionJson: {
                field: 'userTier',
                operator: 'in',
                value: ['ELITE', 'APEX']
            },
            isActive: true
        },
        {
            code: 'FREE_SHIPPING_BOOST',
            displayText: { tr: '🚀 Kargo Bedava Fırsatı!', en: '🚀 Free Shipping Opportunity!' },
            position: 'TOP_RIGHT',
            priority: 70,
            backgroundColor: '#22c55e', // Green-500
            textColor: '#ffffff',
            targetEcosystem: ['BAZARX', 'TICARI_TAKAS', 'BARTER_BORSA'],
            conditionJson: {
                AND: [
                    { field: 'price', operator: 'gt', value: 800 },
                    { field: 'price', operator: 'lte', value: 1000 }
                ]
            },
            isActive: true
        }
    ]

    for (const rule of rules) {
        const data = {
            ...rule,
            name: rule.code,
            badgeText: rule.displayText.tr
        }
        await prisma.badgeRule.upsert({
            where: { code: rule.code },
            update: data,
            create: data
        })
        console.log(`✅ Rule created/updated: ${rule.code}`)
    }

    console.log('✨ Welcome Pack Seeded Successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
