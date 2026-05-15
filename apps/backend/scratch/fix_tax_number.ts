import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.company.updateMany({
    where: {
      taxNumber: 'TAX-SELLER1'
    },
    data: {
      taxNumber: '1234567890'
    }
  });

  console.log('Update result:', result);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
