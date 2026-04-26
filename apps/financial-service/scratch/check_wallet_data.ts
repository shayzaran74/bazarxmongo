
import { PrismaClient } from '../src/generated/client';
import { Decimal } from 'decimal.js';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.FINANCIAL_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/financial?schema=public'
      }
    }
  });

  const userId = '2f925d25-1c61-4ec4-abba-df5f23637950'; // User ID from previous logs

  const accounts = await prisma.account.findMany({
    where: { userId }
  });

  console.log('--- ACCOUNTS ---');
  console.log('--- ACCOUNTS ---');
  console.log(JSON.stringify(accounts, null, 2));

  await prisma.$disconnect();
}

main();
