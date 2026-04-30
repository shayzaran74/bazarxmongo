import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Master Seeding Process (V2)...')
    const hashedPassword = await bcrypt.hash('password123', 10)

    // 1. Categories
    console.log('⏳ Creating Categories...')
    const category = await prisma.category.upsert({
        where: { slug: 'electronic' },
        update: {},
        create: {
            name: 'Electronics',
            slug: 'electronic',
            isActive: true,
            type: 'GENERAL'
        }
    })

    const surplusCategory = await prisma.surplusCategory.upsert({
        where: { name: 'Industrial Equipment' },
        update: {},
        create: {
            name: 'Industrial Equipment',
            slug: 'industrial-equipment',
            isActive: true
        }
    })

    // 2. Users
    const userData = [
        { email: 'admin@barterborsa.com', name: 'Admin User', role: 'ADMIN' },
        { email: 'seller1@barterborsa.com', name: 'Elite Merchant 1', role: 'VENDOR' },
        { email: 'seller2@barterborsa.com', name: 'Elite Merchant 2', role: 'VENDOR' },
        { email: 'customer1@barterborsa.com', name: 'VIP Buyer 1', role: 'USER' },
        { email: 'customer2@barterborsa.com', name: 'VIP Buyer 2', role: 'USER' },
        { email: 'customer3@barterborsa.com', name: 'VIP Buyer 3', role: 'USER' },
    ]

    console.log('⏳ Seeding Users & Related Data...')
    for (const u of userData) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                role: u.role,
                status: 'ACTIVE',
            },
            create: {
                email: u.email,
                password: hashedPassword,
                role: u.role,
                status: 'ACTIVE',
                isEmailVerified: true
            }
        })

        // Create Profile
        const [firstName, ...lastNameParts] = u.name.split(' ')
        const lastName = lastNameParts.join(' ') || '-'
        await prisma.userProfile.upsert({
            where: { userId: user.id },
            update: { firstName, lastName },
            create: { userId: user.id, firstName, lastName }
        })

        // Create Level/XP Info
        await prisma.userLevel.upsert({
            where: { userId: user.id },
            update: {},
            create: { userId: user.id, level: 1, currentXp: 0 }
        })

        // Handle Vendor/Merchant specific data
        if (u.role === 'VENDOR') {
            const companyName = `${u.name} A.Ş.`
            const taxNumber = `TAX-${u.email.split('@')[0].toUpperCase()}`

            const company = await prisma.company.upsert({
                where: { taxNumber: taxNumber },
                update: { name: companyName },
                create: {
                    name: companyName,
                    taxNumber: taxNumber,
                    status: 'APPROVED',
                    verifiedAt: new Date()
                }
            })

            await prisma.companyUser.upsert({
                where: { userId_companyId: { userId: user.id, companyId: company.id } },
                update: { role: 'OWNER' },
                create: { userId: user.id, companyId: company.id, role: 'OWNER' }
            })

            const vendorSlug = u.name.toLowerCase().replace(/\s+/g, '-')
            const vendor = await prisma.vendor.upsert({
                where: { userId: user.id },
                update: { companyId: company.id, slug: vendorSlug, status: 'APPROVED', tier: 'ELITE' },
                create: {
                    userId: user.id,
                    companyId: company.id,
                    slug: vendorSlug,
                    status: 'APPROVED',
                    tier: 'ELITE'
                }
            })

            // Create Vendor Profile
            await prisma.vendorProfile.upsert({
                where: { vendorId: vendor.id },
                update: { storeName: u.name },
                create: {
                    vendorId: vendor.id,
                    storeName: u.name,
                    description: `Premium vendor profile for ${u.name}`,
                    city: 'ISTANBUL'
                }
            })

            // Create Vendor Settings
            await prisma.vendorSettings.upsert({
                where: { vendorId: vendor.id },
                update: { commissionRate: 8.5 },
                create: { vendorId: vendor.id, commissionRate: 8.5 }
            })

            // Create Vendor B2B Data
            await prisma.vendorB2BData.upsert({
                where: { vendorId: vendor.id },
                update: { wholesaleEnabled: true, b2bTier: 'ENTERPRISE' },
                create: { vendorId: vendor.id, wholesaleEnabled: true, b2bTier: 'ENTERPRISE' }
            })

            // Create Vendor Metrics
            await prisma.vendorMetrics.upsert({
                where: { vendorId: vendor.id },
                update: {},
                create: { vendorId: vendor.id }
            })

            // Create Vendor Stats
            await prisma.vendorStats.upsert({
                where: { vendorId: vendor.id },
                update: { trustScore: 100 },
                create: { vendorId: vendor.id, trustScore: 100 }
            })
            
            // Create Vendor Bank Account
            await prisma.vendorBankAccount.upsert({
                where: { vendorId: vendor.id },
                update: {  bankName: 'Bazarx Bank', accountHolderName: u.name, iban: 'TR001122334455667788990011' },
                create: { vendorId: vendor.id, bankName: 'Bazarx Bank', accountHolderName: u.name, iban: 'TR001122334455667788990011', isPrimary: true }
            })
        }
    }

    // 3. Catalog Products & Listings
    console.log('⏳ Creating Listings...')
    const catalogProduct = await prisma.catalogProduct.upsert({
        where: { slug: 'industrial-lathe-m1' },
        update: {},
        create: {
            name: 'Industrial Lathe M1',
            brand: 'SanayiGlobal',
            description: 'Professional industrial lathe for heavy duty metal work.',
            slug: 'industrial-lathe-m1',
            categoryId: category.id,
        }
    })

    const seller1UserForVendor = await prisma.user.findUnique({ where: { email: 'seller1@barterborsa.com' } })
    const vendor1 = seller1UserForVendor ? await prisma.vendor.findFirst({ where: { userId: seller1UserForVendor.id } }) : null
    if (vendor1) {
        await prisma.listing.upsert({
            where: { slug: 'lathe-m1-seller1' },
            update: {
                price: 150000,
                stock: 5,
                status: 'ACTIVE'
            },
            create: {
                catalogProductId: catalogProduct.id,
                vendorId: vendor1.id,
                title: 'Industrial Lathe M1 - Standard Edition',
                price: 150000,
                stock: 5,
                status: 'ACTIVE',
                condition: 'NEW',
                slug: 'lathe-m1-seller1'
            }
        })
    }

    // 4. Surplus Items
    console.log('⏳ Creating Surplus Items...')
    const seller1User = await prisma.user.findUnique({ where: { email: 'seller1@barterborsa.com' } })
    const seller1CompanyUser = seller1User ? await prisma.companyUser.findFirst({ where: { userId: seller1User.id } }) : null
    
    if (seller1CompanyUser) {
        // Find existing surplus item or create
        const existingSurplus = await prisma.surplusItem.findFirst({
            where: { companyId: seller1CompanyUser.companyId, title: 'High-Grade Steel Plates' }
        })

        if (!existingSurplus) {
            await prisma.surplusItem.create({
                data: {
                    companyId: seller1CompanyUser.companyId,
                    title: 'High-Grade Steel Plates',
                    description: 'Surplus steel plates from recent project, 10mm thick.',
                    category: 'Industrial Equipment',
                    quantity: 50,
                    unit: 'PCS',
                    unitPrice: 2000,
                    status: 'ACTIVE',
                    city: 'ISTANBUL'
                }
            })
        }
    }

    console.log('\n✅ Master Seeding Completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
