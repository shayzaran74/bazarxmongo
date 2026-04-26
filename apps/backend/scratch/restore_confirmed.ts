
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://barterborsa:barterborsa123@localhost:5432/barterborsa_core?schema=public'
      }
    }
  });

  const confirmedOrderNumbers = [
    'BB-20260424-68720',
    'BB-20260424-91033',
    'BB-20260423-36455',
    'BB-20260423-16412',
    'BB-20260423-80483'
  ];

  for (const num of confirmedOrderNumbers) {
    await prisma.order.update({
      where: { orderNumber: num },
      data: { status: 'CONFIRMED' }
    });
  }

  console.log('Restored CONFIRMED status for specific orders.');
  await prisma.$disconnect();
}

main();
