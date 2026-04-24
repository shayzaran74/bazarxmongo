import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  const result = await prisma.catalogProduct.updateMany({
    where: { status: 'ACTIVE' },
    data: {
      isFeatured: true,
      isSpecialOffer: true
    }
  })
  console.log(`Updated ${result.count} products to featured and special offer.`)
  await prisma.$disconnect()
}

main()
