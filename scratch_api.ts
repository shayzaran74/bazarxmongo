import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const item = await prisma.catalogProduct.findFirst({
    include: {
      media: { orderBy: { sortOrder: 'asc' } },
      listings: { take: 1, orderBy: { price: 'asc' } }
    }
  });
  console.log(JSON.stringify(item, null, 2));
}
run();
