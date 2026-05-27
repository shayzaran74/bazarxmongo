import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    take: 10,
    select: { id: true, name: true, slug: true, parentId: true, isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  const products = await prisma.catalogProduct.findMany({
    take: 5,
    select: { id: true, name: true, categoryId: true, status: true },
    orderBy: { createdAt: 'desc' }
  });

  console.log('--- RECENT CATEGORIES ---');
  console.log(JSON.stringify(categories, null, 2));
  console.log('--- RECENT PRODUCTS ---');
  console.log(JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
