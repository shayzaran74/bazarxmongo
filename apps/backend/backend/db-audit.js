const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const settings = await prisma.systemSetting.findMany();
    console.log('--- ALL SETTING KEYS ---');
    if (settings.length === 0) console.log('No settings found at all!');
    settings.forEach(s => console.log(`Key: ${s.key}`));
    
    const homepage = settings.find(s => s.key.toLowerCase().includes('home'));
    if (homepage) {
      console.log('\n--- FOUND HOMEPAGE RELATED KEY ---');
      console.log(`Key: ${homepage.key}`);
      console.log(homepage.value);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
