import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
    const data: any[] = await prisma.groupBuy.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const productIds = data.map(d => d.productId).filter(Boolean) as string[];
    const products = productIds.length > 0 ? await prisma.catalogProduct.findMany({
      where: { id: { in: productIds } },
      include: { media: { take: 1 } },
    }) : [];
    
    console.log("DB DATA:", JSON.stringify(data, null, 2));
    console.log("PRODUCTS:", JSON.stringify(products, null, 2));
}
run();
