
import { PrismaClient } from '../src/generated/client';

async function main() {
  const prisma = new PrismaClient();
  const txs = await prisma.accountTransaction.findMany({ take: 5 });
  console.log('Sample Transactions:', JSON.stringify(txs, null, 2));
  
  const accounts = await prisma.account.findMany({ take: 5 });
  console.log('Sample Accounts:', JSON.stringify(accounts, null, 2));

  await prisma.$disconnect();
}

main();
