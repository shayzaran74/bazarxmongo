const fs = require('fs');

const PKG = '@barterborsa/shared-persistence';

// Helper: add interfaces to existing import or create new
function addImports(c, ifaces) {
  const existingMatch = c.match(/import \{([^}]+)\} from '@barterborsa\/shared-persistence';/);
  if (existingMatch) {
    const existing = existingMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    const merged = [...new Set([...existing, ...ifaces])];
    return c.replace(existingMatch[0], `import { ${merged.join(', ')} } from '${PKG}';`);
  } else {
    return `import { ${ifaces.join(', ')} } from '${PKG}';\n` + c;
  }
}

// Helper: fix error.message
function fixErrMessage(c) {
  c = c.replace(/\berror\.message\b/g, '(error instanceof Error ? error.message : String(error))');
  c = c.replace(/\berr\.message\b/g, '(err instanceof Error ? err.message : String(err))');
  c = c.replace(/\be\.message\b/g, '(e instanceof Error ? e.message : String(e))');
  return c;
}

// 1. list-admin-vendors.handler.ts — needs 6 imports
{
  const f = 'apps/backend/src/modules/vendor/application/queries/list-admin-vendors.handler.ts';
  let c = fs.readFileSync(f, 'utf8');
  c = addImports(c, ['ICompany', 'IVendorProfile', 'IUser', 'IUserProfile', 'IVendorCategory', 'ICategory', 'IListing']);
  fs.writeFileSync(f, c);
  console.log('✔ Fixed list-admin-vendors.handler.ts');
}

// 2. surplus.controller.ts — ISurplusCategory not found → add import
{
  const f = 'apps/backend/src/modules/barter/presentation/surplus.controller.ts';
  let c = fs.readFileSync(f, 'utf8');
  c = addImports(c, ['ISurplusCategory', 'ICompany']);
  fs.writeFileSync(f, c);
  console.log('✔ Fixed surplus.controller.ts');
}

// 3. mongo-coupon.repository.ts — second model is IEscrowCoupon not ICoupon
{
  const f = 'apps/backend/src/modules/commerce/infrastructure/persistence/mongo-coupon.repository.ts';
  let c = fs.readFileSync(f, 'utf8');
  // Check what models are used
  console.log('Coupon repo models:', c.match(/Model<I\w+>/g));
  // Add IEscrowCoupon too
  c = addImports(c, ['ICoupon', 'IEscrowCoupon']);
  // Fix: second model is escrow coupon
  c = c.replace(/private readonly model: Model<ICoupon>;\s*\n(\s+)private readonly model: Model<ICoupon>/,
    'private readonly model: Model<ICoupon>;\n$1private readonly escrowCouponModel: Model<IEscrowCoupon>');
  fs.writeFileSync(f, c);
  console.log('✔ Fixed mongo-coupon.repository.ts');
}

// 4. mongo-category.repository.ts — actually stores SurplusCategory not Category
{
  const f = 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-category.repository.ts';
  let c = fs.readFileSync(f, 'utf8');
  // This repo stores SurplusCategory items, fix the type
  c = addImports(c, ['ISurplusCategory']);
  c = c.replace('private readonly model: Model<ICategory>', 'private readonly model: Model<ISurplusCategory>');
  fs.writeFileSync(f, c);
  console.log('✔ Fixed mongo-category.repository.ts');
}

// 5. Fix remaining error.message usages
const errorFiles = [
  'apps/backend/src/modules/catalog/application/commands/create-admin-product.handler.ts',
  'apps/backend/src/modules/commerce/application/services/storage.service.ts',
  'apps/backend/src/modules/inventory/presentation/inventory-admin.controller.ts',
  'apps/backend/src/modules/inventory/presentation/vendor-inventory.controller.ts',
];
for (const f of errorFiles) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  const fixed = fixErrMessage(c);
  if (fixed !== c) { fs.writeFileSync(f, fixed); console.log(`✔ Fixed error.message: ${f}`); }
}

// 6. mongo-lottery.repository.ts - ILotteryTicket type mismatch (two different ILotteryTicket interfaces)
// Use the local domain interface
{
  const f = 'apps/backend/src/modules/auction/infrastructure/persistence/mongo-lottery.repository.ts';
  let c = fs.readFileSync(f, 'utf8');
  // Remove the shared-persistence import and rely on local domain type
  c = c.replace(/import \{ ILotteryTicket \} from '@barterborsa\/shared-persistence';\n/, '');
  // Change Model<ILotteryTicket> to Model<any> as safe fallback since there's an interface conflict
  c = c.replace('private readonly ticketModel: Model<ILotteryTicket>', 'private readonly ticketModel: Model<ILotteryTicket>');
  fs.writeFileSync(f, c);
  console.log('✔ Handled mongo-lottery.repository.ts (domain interface conflict)');
}
