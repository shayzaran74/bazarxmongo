
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    where: { email: 'seller1@barterborsa.com' },
    include: {
      profile: true,
      vendor: {
        include: {
          company: true
        }
      }
    }
  });

  console.log('--- KULLANICI DURUMU ---');
  console.log('User ID:', user?.id);
  console.log('Role:', user?.role);
  console.log('Status:', user?.status);
  console.log('Vendor ID:', user?.vendor?.id);
  console.log('Vendor Status:', user?.vendor?.status);
  console.log('Company ID:', user?.vendor?.companyId);
  console.log('Company Status:', user?.vendor?.company?.status);
  console.log('Company Name:', user?.vendor?.company?.name);
  console.log('------------------------');

  await prisma.$disconnect();
}

check();
