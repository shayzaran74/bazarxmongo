
import { PrismaClient } from '../src/generated/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://barterborsa:barterborsa123@localhost:5432/barterborsa_financial?schema=public'
      }
    }
  });

  const userId = '2f925d25-1c61-4ec4-abba-df5f23637950';

  console.log('--- AUDITING ALL TRANSACTIONS FOR USER ---');

  // 1. Account Transactions
  const accounts = await prisma.account.findMany({ where: { userId } });
  const accountIds = accounts.map(a => a.id);
  
  const accTransactions = await prisma.accountTransaction.findMany({
    where: { accountId: { in: accountIds } },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(`\nFound ${accTransactions.length} AccountTransactions:`);
  accTransactions.forEach(tx => {
    console.log(`[${tx.createdAt.toISOString()}] ${tx.type} | ${tx.amount} | ${tx.direction} | ${tx.description}`);
  });

  // 2. User Ledger Entries
  const userLedger = await prisma.userLedgerEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(`\nFound ${userLedger.length} UserLedgerEntries:`);
  userLedger.forEach(l => {
    console.log(`[${l.createdAt.toISOString()}] ${l.type} | ${l.amount} | ${l.currency} | ${l.description}`);
  });

  // 3. General Ledger (Double Entry)
  const generalLedger = await prisma.generalLedger.findMany({
    where: {
      OR: [
        { debitAccountId: userId },
        { creditAccountId: userId },
        { debitAccountId: { in: accountIds } },
        { creditAccountId: { in: accountIds } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(`\nFound ${generalLedger.length} GeneralLedger Entries (Global):`);
  generalLedger.forEach(g => {
    console.log(`[${g.createdAt.toISOString()}] ${g.type} | ${g.amount} | DR:${g.debitAccountId} | CR:${g.creditAccountId} | ${g.note}`);
  });

  await prisma.$disconnect();
}

main();
