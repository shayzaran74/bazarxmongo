
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://barterborsa:barterborsa123@localhost:5432/barterborsa_core?schema=public'
      }
    }
  });

  const orderId = 'e300e755-3db6-42a6-91f8-7c4cfd9dd946';
  
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  console.log('--- ORDER DATA ---');
  console.log(JSON.stringify(order, null, 2));

  await prisma.$disconnect();
}

main();
