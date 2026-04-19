import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10)

    const user = await prisma.user.upsert({
        where: { email: 'admin@barterborsa.com' },
        update: {},
        create: {
            email: 'admin@barterborsa.com',
            password: hashedPassword,
            name: 'Admin User',
            isAdmin: true,
            isSuperAdmin: true,
            status: 'ACTIVE'
        }
    })

    console.log('✅ Created test admin user:', user.email)

    const vendor = await prisma.vendor.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            businessName: 'Sanayi Takas Test A.Ş.',
            businessType: 'CORPORATE',
            status: 'APPROVED',
            isB2B: true
        }
    })

    console.log('✅ Created test vendor for admin:', vendor.businessName)
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
