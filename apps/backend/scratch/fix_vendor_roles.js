const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRoles() {
  console.log('🚀 Starting role fix for approved vendors...');
  
  const approvedVendors = await prisma.vendor.findMany({
    where: { status: 'APPROVED' },
    select: { userId: true }
  });

  console.log(`Found ${approvedVendors.length} approved vendors.`);

  for (const vendor of approvedVendors) {
    if (vendor.userId) {
      await prisma.user.update({
        where: { id: vendor.userId },
        data: { role: 'VENDOR' }
      });
      console.log(`✅ Fixed role for user ${vendor.userId}`);
    }
  }

  console.log('✨ All roles synchronized.');
}

fixRoles()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
