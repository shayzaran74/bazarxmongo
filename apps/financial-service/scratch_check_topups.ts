import { PrismaClient } from './src/generated/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const requests = await prisma.accountTopUpRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    console.log('--- Son 20 Para Yükleme Talebi ---');
    console.table(requests.map(r => ({
      id: r.id,
      userId: r.userId,
      amount: r.amount.toString(),
      status: r.status,
      method: r.paymentMethod,
      createdAt: r.createdAt.toISOString()
    })));
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
