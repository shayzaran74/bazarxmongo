const fs = require('fs');

// 1. Fix circuit-breaker.service.ts - error.message on unknown
{
  const f = 'apps/backend/src/common/resilience/circuit-breaker.service.ts';
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(
    'Circuit breaker \'${name}\' fallback döndü: ${error.message}',
    'Circuit breaker \'${name}\' fallback döndü: ${error instanceof Error ? error.message : String(error)}'
  );
  fs.writeFileSync(f, c);
  console.log('✔ Fixed circuit-breaker.service.ts');
}

// 2. Fix mongo-lottery.repository.ts - wrong Model<Document> → Model<ILotteryTicket>
{
  const f = 'apps/backend/src/modules/auction/infrastructure/persistence/mongo-lottery.repository.ts';
  let c = fs.readFileSync(f, 'utf8');
  // Replace Model<Document> with Model<ILotteryTicket>
  c = c.replace(/private readonly ticketModel: Model<Document>/g, 'private readonly ticketModel: Model<ILotteryTicket>');
  // Ensure ILotteryTicket is imported
  if (!c.includes('ILotteryTicket')) {
    c = `import { ILotteryTicket } from '@barterborsa/shared-persistence';\n` + c;
  }
  fs.writeFileSync(f, c);
  console.log('✔ Fixed mongo-lottery.repository.ts');
}

// 3. Fix mongo-transfer.repository.ts - ITransfer and ITransferItem
{
  const f = 'apps/backend/src/modules/inventory/infrastructure/persistence/mongo-transfer.repository.ts';
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/private readonly model: Model<Document>/g, 'private readonly model: Model<ITransfer>');
  c = c.replace(/private readonly itemModel: Model<Document>/g, 'private readonly itemModel: Model<ITransferItem>');
  // Ensure imports
  if (!c.includes('ITransfer')) {
    c = `import { ITransfer, ITransferItem } from '@barterborsa/shared-persistence';\n` + c;
  }
  fs.writeFileSync(f, c);
  console.log('✔ Fixed mongo-transfer.repository.ts');
}

// 4. Fix barter repos with Document fallbacks
const barterRepoFixes = [
  { f: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-category.repository.ts',  iface: 'ICategory' },
  { f: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-wanted-item.repository.ts', iface: 'IWantedItem' },
  { f: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-user-level.repository.ts', iface: 'IUserLevel' },
  { f: 'apps/backend/src/modules/identity/infrastructure/persistence/mongo-referral.repository.ts',  iface: 'IReferral' },
  { f: 'apps/backend/src/modules/identity/infrastructure/persistence/mongo-user.repository.ts',      iface: 'IUser' },
  { f: 'apps/backend/src/modules/commerce/infrastructure/persistence/mongo-coupon.repository.ts',    iface: 'ICoupon' },
  { f: 'apps/backend/src/modules/commerce/infrastructure/persistence/mongo-user-address.repository.ts', iface: 'IUserAddress' },
];

for (const { f, iface } of barterRepoFixes) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  // Replace any Model<Document> with proper type
  c = c.replace(/private readonly model: Model<Document>/g, `private readonly model: Model<${iface}>`);
  // Ensure import exists
  if (!c.includes(iface)) {
    c = c.replace(
      /import \{ ([^}]+) \} from '@barterborsa\/shared-persistence';/,
      (m, items) => `import { ${items.trim()}, ${iface} } from '@barterborsa/shared-persistence';`
    );
  }
  fs.writeFileSync(f, c);
  console.log(`✔ Fixed ${f}`);
}

// 5. Fix remaining error.message usages in unknown catches
const catchFiles = [
  'apps/backend/src/modules/catalog/application/commands/bulk-delete-admin-products.handler.ts',
  'apps/backend/src/modules/catalog/application/commands/create-admin-product.handler.ts',
  'apps/backend/src/modules/commerce/application/services/order-escrow-worker.service.ts',
  'apps/backend/src/modules/commerce/application/services/storage.service.ts',
  'apps/backend/src/modules/communication/application/event-handlers/user-registered-notification.handler.ts',
  'apps/backend/src/modules/identity/identity.module.ts',
];

for (const f of catchFiles) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  const original = c;
  // Replace .message on unknown error variables
  c = c.replace(/\berror\.message\b/g, '(error instanceof Error ? error.message : String(error))');
  c = c.replace(/\berr\.message\b/g, '(err instanceof Error ? err.message : String(err))');
  c = c.replace(/\be\.message\b/g, '(e instanceof Error ? e.message : String(e))');
  if (c !== original) {
    fs.writeFileSync(f, c);
    console.log(`✔ Fixed error.message: ${f}`);
  }
}
