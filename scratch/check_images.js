const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const productMediaCount = await prisma.productMedia.count();
    const listingImageCount = await prisma.listingImage.count();
    console.log(`ProductMedia count: ${productMediaCount}`);
    console.log(`ListingImage count: ${listingImageCount}`);
    
    if (productMediaCount > 0) {
        const media = await prisma.productMedia.findMany({ take: 5 });
        console.log('Sample ProductMedia:', JSON.stringify(media, null, 2));
    }
    
    if (listingImageCount > 0) {
        const images = await prisma.listingImage.findMany({ take: 5 });
        console.log('Sample ListingImage:', JSON.stringify(images, null, 2));
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
