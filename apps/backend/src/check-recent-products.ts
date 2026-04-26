import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const products = await prisma.catalogProduct.findMany({
    where: { createdAt: { gte: oneHourAgo } },
    include: { listings: true, media: true }
  });
  console.log('Products created in the last hour:', JSON.stringify(products, null, 2));
}
main();
