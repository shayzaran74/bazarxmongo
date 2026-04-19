import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    process.stdout.write('🚀 Starting Comprehensive Seeding Process...\n')
    const hashedPassword = await bcrypt.hash('password123', 10)

    // 1. Base Data: Categories
    process.stdout.write('⏳ Creating Categories...\n')
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

    // 2. Users Definition (1 Admin, 2 Sellers, 3 Customers)
    const userData = [
        { email: 'admin@barterborsa.com', name: 'Admin User', isAdmin: true, isSuperAdmin: true },
        { email: 'seller1@barterborsa.com', name: 'Elite Merchant 1', currentTier: 'ELITE' },
        { email: 'seller2@barterborsa.com', name: 'Elite Merchant 2', currentTier: 'ELITE' },
        { email: 'customer1@barterborsa.com', name: 'VIP Buyer 1',loyaltyTier: 'PLATINUM' },
        { email: 'customer2@barterborsa.com', name: 'VIP Buyer 2', loyaltyTier: 'PLATINUM' },
        { email: 'customer3@barterborsa.com', name: 'VIP Buyer 3', loyaltyTier: 'PLATINUM' },
    ]

    const users = []
    
    process.stdout.write('⏳ Seeding Users & Accounts...\n')
    for (const u of userData) {
        // Upsert User
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                name: u.name,
                isAdmin: u.isAdmin || false,
                isSuperAdmin: u.isSuperAdmin || false,
                currentTier: u.currentTier || 'CORE',
                loyaltyTier: u.loyaltyTier || 'BEGINNER',
                status: 'ACTIVE',
            },
            create: {
                email: u.email,
                name: u.name,
                password: hashedPassword,
                isAdmin: u.isAdmin || false,
                isSuperAdmin: u.isSuperAdmin || false,
                currentTier: u.currentTier || 'CORE',
                loyaltyTier: u.loyaltyTier || 'BEGINNER',
                status: 'ACTIVE',
                isEmailVerified: true
            }
        })
        users.push(user)

        // Create Company & Vendor for Sellers
        if (u.name.includes('Merchant')) {
            const company = await prisma.company.create({
                data: {
                    name: `${u.name} A.Ş.`,
                    taxNumber: `TAX-${Math.floor(Math.random() * 1000000)}`,
                    status: 'APPROVED'
                }
            })
            await prisma.companyUser.upsert({
                where: { userId_companyId: { userId: user.id, companyId: company.id } },
                update: {},
                create: { userId: user.id, companyId: company.id, role: 'OWNER' }
            })
            await prisma.vendor.upsert({
                where: { userId: user.id },
                update: { businessName: `${u.name} Ticari`, status: 'APPROVED', isB2B: true, vendorTier: 'PRIME' },
                create: {
                    userId: user.id,
                    businessName: `${u.name} Ticari`,
                    businessType: 'CORPORATE',
                    status: 'APPROVED',
                    isB2B: true,
                    vendorTier: 'PRIME'
                }
            })
            // Connect User to Company
            await prisma.user.update({
                where: { id: user.id },
                data: { connectedCompanyId: company.id }
            })
        } else if (u.name.includes('Buyer')) {
            // Customers can also have companies in this system
             const company = await prisma.company.create({
                data: {
                    name: `${u.name} Şahıs Şirketi`,
                    taxNumber: `TAX-${Math.floor(Math.random() * 1000000)}`,
                    status: 'APPROVED'
                }
            })
            await prisma.companyUser.upsert({
                where: { userId_companyId: { userId: user.id, companyId: company.id } },
                update: {},
                create: { userId: user.id, companyId: company.id, role: 'OWNER' }
            })
            await prisma.user.update({
                where: { id: user.id },
                data: { connectedCompanyId: company.id }
            })
        }

        // Initialize Accounts with large balances
        const accountTypes = ['MAIN', 'XP_TRADE', 'BARTER']
        for (const type of accountTypes) {
            await prisma.account.upsert({
                where: { userId_type: { userId: user.id, type: type } },
                update: {
                    balance: 1000000,
                    availableBalance: 1000000
                },
                create: {
                    userId: user.id,
                    type: type,
                    balance: 1000000,
                    availableBalance: 1000000,
                    currency: type === 'MAIN' ? 'TRY' : (type === 'XP_TRADE' ? 'XP' : 'BARTER')
                }
            })
        }
    }

    const seller1 = users.find(u => u.email === 'seller1@barterborsa.com')
    const customer1 = users.find(u => u.email === 'customer1@barterborsa.com')
    
    if (!seller1 || !customer1) throw new Error('Seller or customer not found in seed')
    
    const seller1Company = await prisma.company.findFirst({ where: { users: { some: { userId: seller1.id } } } })
    const customer1Company = await prisma.company.findFirst({ where: { users: { some: { userId: customer1.id } } } })

    // 3. Products & Listings
    process.stdout.write('⏳ Creating Listings & Surplus Items...\n')
    const catalogProduct = await prisma.catalogProduct.upsert({
        where: { slug: 'industrial-lathe-m1' },
        update: {},
        create: {
            name: 'Industrial Lathe M1',
            brand: 'SanayiGlobal',
            description: 'Professional industrial lathe for heavy duty metal work.',
            categoryId: category.id,
            slug: 'industrial-lathe-m1',
            images: ['https://placehold.co/600x400?text=Lathe']
        }
    })

    const vendor1 = await prisma.vendor.findFirst({ where: { userId: seller1.id } })
    if (!vendor1) throw new Error('Vendor 1 not found')
    const listing = await prisma.listing.create({
        data: {
            catalogProductId: catalogProduct.id,
            vendorId: vendor1.id,
            price: 150000,
            stock: 5,
            status: 'ACTIVE',
            condition: 'NEW'
        }
    })

    // Surplus Item (Takas İlanı)
    const surplusItem = await prisma.surplusItem.create({
        data: {
            companyId: seller1Company.id,
            title: 'High-Grade Steel Plates',
            description: 'Surplus steel plates from recent project, 10mm thick.',
            category: 'Materials',
            quantity: 50,
            unit: 'PCS',
            unitPrice: 2000,
            status: 'ACTIVE'
        }
    })

    // 4. Auctions
    process.stdout.write('⏳ Creating Auctions...\n')
    await prisma.auction.create({
        data: {
            listingId: listing.id,
            userId: seller1.id,
            startingPrice: 100000,
            currentPrice: 100000,
            minBidIncrement: 5000,
            startTime: new Date(),
            endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
            status: 'ACTIVE'
        }
    })

    // 5. Trade Offers
    process.stdout.write('⏳ Creating Trade Offers...\n')
    await prisma.tradeOffer.create({
        data: {
            fromCompanyId: customer1Company.id,
            toCompanyId: seller1Company.id,
            requestedItemId: surplusItem.id,
            offeredQuantity: 0,
            requestedQuantity: 5,
            message: 'Barter proposed for the steel plates.',
            status: 'PENDING'
        }
    })

    // 6. Marketing: Campaigns & Coupons
    process.stdout.write('⏳ Creating Campaigns & Coupons...\n')
    const campaign = await prisma.campaign.create({
        data: {
            title: 'Founders Launch Discount',
            name: 'LAUNCH2024',
            type: 'PERCENTAGE',
            status: 'ACTIVE',
            startDate: new Date(),
            rewardValue: 20 // 20%
        }
    })

    await prisma.coupon.upsert({
        where: { code: 'WELCOME25' },
        update: {},
        create: {
            code: 'WELCOME25',
            campaignId: campaign.id,
            ownerId: customer1.id,
            status: 'ACTIVE'
        }
    })

    process.stdout.write('\n✅ Master Seeding Completed for all required entities\n')
    process.stdout.write('--------------------------------------------\n')
    process.stdout.write(`Admin: ${userData[0].email} / password123\n`)
    process.stdout.write(`Sellers: seller1@ / seller2@ / password123\n`)
    process.stdout.write(`Customers: customer1@ / customer2@ / customer3@ / password123\n`)
    process.stdout.write('--------------------------------------------\n')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
