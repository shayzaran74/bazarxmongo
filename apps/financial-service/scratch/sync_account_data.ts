
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
  
  // 1. Get current balance from Wallet table
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  
  if (wallet) {
    console.log(`Current Wallet Balance: ${wallet.balanceTL}`);
    
    // 2. Update Account table to match
    const account = await prisma.account.update({
      where: { userId_type: { userId, type: 'MAIN' } },
      data: {
        balance: wallet.balanceTL,
        availableBalance: wallet.balanceTL,
        status: 'ACTIVE'
      }
    });
    
    console.log(`Account table updated. Balance: ${account.balance}, Available: ${account.availableBalance}`);
  }

  await prisma.$disconnect();
}

main();
