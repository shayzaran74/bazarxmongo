const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    where: { email: 'seller1@barterborsa.com' },
    include: {
      vendor: {
        include: {
          company: true
        }
      }
    }
  });

  if (!user) {
    console.log('Kullanıcı bulunamadı');
    return;
  }

  console.log('--- USER STATUS ---');
  console.log('ID:', user.id);
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Vendor Status:', user.vendor?.status);
  console.log('Company ID:', user.vendor?.company_id);
  console.log('Company Status:', user.vendor?.company?.status);
  
  await prisma.$disconnect();
}

check();
