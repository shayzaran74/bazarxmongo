const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, status: true }
  });
  console.log('--- DATABASE USERS ---');
  console.table(users);
  await prisma.$disconnect();
}

check().catch(console.error);
