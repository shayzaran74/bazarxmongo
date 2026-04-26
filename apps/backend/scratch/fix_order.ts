
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
  
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      paymentStatus: 'COMPLETED'
    }
  });

  console.log('--- ORDER UPDATED ---');
  console.log(`ID: ${updatedOrder.id}`);
  console.log(`Status: ${updatedOrder.status}`);
  console.log(`PaidAt: ${updatedOrder.paidAt}`);

  await prisma.$disconnect();
}

main();
