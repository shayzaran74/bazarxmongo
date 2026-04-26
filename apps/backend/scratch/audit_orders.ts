
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://barterborsa:barterborsa123@localhost:5432/barterborsa_core?schema=public'
      }
    }
  });

  console.log('--- ORDER AUDIT STARTED ---');

  // 1. Find orders that are COMPLETED in payment but PENDING in status
  // OR WALLET orders that are CONFIRMED/PAID but PENDING in payment
  const stuckOrders = await prisma.order.findMany({
    where: {
      OR: [
        {
          status: 'PENDING',
          paymentStatus: 'COMPLETED'
        },
        {
          status: 'PAID',
          paidAt: null
        },
        {
          paymentMethod: 'WALLET',
          paymentStatus: 'PENDING',
          status: { in: ['PAID', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'] }
        }
      ]
    }
  });

  console.log(`Found ${stuckOrders.length} stuck orders.`);

  for (const order of stuckOrders) {
    console.log(`Fixing Order ${order.orderNumber} (ID: ${order.id})...`);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status === 'PENDING' ? 'PAID' : order.status,
        paidAt: order.paidAt || new Date(),
        paymentStatus: 'COMPLETED'
      }
    });
  }

  // 2. Summary of current statuses for the user's specific orders
  const userOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paidAt: true,
      totalAmount: true,
      paymentMethod: true
    }
  });

  console.log('--- RECENT ORDERS SUMMARY ---');
  userOrders.forEach(o => {
    console.log(`${o.orderNumber}: Status=${o.status}, Payment=${o.paymentStatus}, Method=${o.paymentMethod}, PaidAt=${o.paidAt}, Amount=${o.totalAmount}`);
  });

  await prisma.$disconnect();
}

main();
