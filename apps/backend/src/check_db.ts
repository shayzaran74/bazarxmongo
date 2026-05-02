
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const items = await prisma.surplusItem.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      companyId: true
    }
  })
  console.log('--- SURPLUS ITEMS IN DB ---')
  console.log(JSON.stringify(items, null, 2))
  console.log('Total:', items.length)
}

main().catch(console.error).finally(() => prisma.$disconnect())
