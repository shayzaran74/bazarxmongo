import { PrismaClient } from '@prisma/client';
import { ListAdminProductsHandler } from './apps/backend/src/modules/catalog/application/queries/list-admin-products/list-admin-products.handler';

const prisma = new PrismaClient();
const handler = new ListAdminProductsHandler(prisma as any);

async function run() {
  const result = await handler.execute({ filters: { limit: 1 } } as any);
  console.log(JSON.stringify(result.items[0], null, 2));
}
run();
