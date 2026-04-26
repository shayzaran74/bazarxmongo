import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.accountTopUpRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  console.log('--- Last 3 Requests ---');
  console.log(requests);

  if (requests.length > 0) {
    const userId = requests[0].userId;
    console.log(`\n--- Fetching info for User ${userId} ---`);

    const accs = await prisma.account.findMany({ where: { userId } });
    console.log('Prisma Accounts:');
    console.log(accs.map((a: any) => ({ id: a.id, type: a.type, balance: a.balance, available: a.availableBalance })));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
