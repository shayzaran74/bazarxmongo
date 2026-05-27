
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.surplusItem.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, status: true, createdAt: true }
  });
  console.log(JSON.stringify(items, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
