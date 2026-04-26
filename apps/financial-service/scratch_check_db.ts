
import { PrismaClient } from './src/generated/client';

async function checkDb() {
  const prisma = new PrismaClient();
  try {
    const accountCount = await prisma.account.count();
    const txCount = await prisma.accountTransaction.count();
    const ledgerCount = await prisma.generalLedger.count();
    
    console.log('Accounts:', accountCount);
    console.log('AccountTransactions:', txCount);
    console.log('GeneralLedger:', ledgerCount);

    if (txCount > 0) {
      const sampleTx = await prisma.accountTransaction.findFirst({
        include: { account: true }
      });
      console.log('Sample Transaction:', JSON.stringify(sampleTx, null, 2));
    }

    if (accountCount > 0) {
      const sampleAccount = await prisma.account.findFirst();
      console.log('Sample Account:', JSON.stringify(sampleAccount, null, 2));
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
