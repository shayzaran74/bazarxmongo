const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();
  const password = await bcrypt.hash('admin123', 10);
  
  try {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@bazarx.com' },
      update: {},
      create: {
        email: 'admin@bazarx.com',
        password: password,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log('Admin kullanıcısı başarıyla oluşturuldu:', admin.email);
  } catch (e) {
    console.error('Hata:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
