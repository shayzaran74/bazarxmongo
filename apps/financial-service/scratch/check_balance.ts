import { PrismaClient } from './src/generated/client/index.js';
const prisma = new PrismaClient();

async function main() {
  const reqs = await prisma.accountTopUpRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  if (reqs.length === 0) {
    console.log("No top-up requests");
    return;
  }
  const userId = reqs[0].userId;
  console.log(`TopUp for user: ${userId}, amount: ${reqs[0].amount}, status: ${reqs[0].status}`);

  const wallet = await prisma.wallet.findUnique({ where: { userId }});
  console.log('Legacy Wallet:', wallet?.balanceTL?.toString());

  const accounts = await prisma.account.findMany({ where: { userId, type: 'MAIN' }});
  console.log('Account DB:', accounts[0]?.balance?.toString(), ' / ', accounts[0]?.availableBalance?.toString());
}
main().catch(console.error).finally(() => prisma.$disconnect());
