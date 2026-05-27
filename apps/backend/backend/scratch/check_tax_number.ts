import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    include: {
      vendor: {
        include: {
          company: true
        }
      }
    }
  });

  console.log('User:', {
    id: user?.id,
    email: user?.email,
    vendorId: user?.vendor?.id,
    companyId: user?.vendor?.companyId,
    taxNumber: user?.vendor?.company?.taxNumber
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
