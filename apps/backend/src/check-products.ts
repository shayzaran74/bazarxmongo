import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.catalogProduct.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { listings: true }
  });
  console.log('Recent CatalogProducts:', JSON.stringify(products, null, 2));
}
main();
