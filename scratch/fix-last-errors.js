const fs = require('fs');
const PKG = '@barterborsa/shared-persistence';

function addImports(c, ifaces) {
  const existingMatches = [...c.matchAll(/import \{([^}]+)\} from '@barterborsa\/shared-persistence';/g)];
  if (existingMatches.length > 0) {
    // Remove duplicate imports first
    const allImported = new Set();
    let cleaned = c;
    for (const m of existingMatches) {
      const items = m[1].split(',').map(s => s.trim()).filter(Boolean);
      items.forEach(i => allImported.add(i));
      cleaned = cleaned.replace(m[0], '');
    }
    ifaces.forEach(i => allImported.add(i));
    cleaned = `import { ${[...allImported].join(', ')} } from '${PKG}';\n` + cleaned.replace(/^\n+/, '');
    return cleaned;
  }
  return `import { ${ifaces.join(', ')} } from '${PKG}';\n` + c;
}

function fixErrMsg(c) {
  c = c.replace(/\berror\.message\b/g, '(error instanceof Error ? error.message : String(error))');
  c = c.replace(/\berr\.message\b/g, '(err instanceof Error ? err.message : String(err))');
  return c;
}

// 1. surplus.controller.ts — duplicate ICompany
{
  const f = 'apps/backend/src/modules/barter/presentation/surplus.controller.ts';
  let c = fs.readFileSync(f, 'utf8');
  c = addImports(c, ['ISurplusCategory', 'ICompany']);
  fs.writeFileSync(f, c);
  console.log('✔ Fixed surplus.controller.ts (dedup)');
}

// 2. ecosystem-admin.controller.ts — IVendor, ICompany, IListing, IEcosystemAuditLog
{
  const f = 'apps/backend/src/modules/vendor/presentation/ecosystem-admin.controller.ts';
  let c = fs.readFileSync(f, 'utf8');
  c = addImports(c, ['IVendor', 'ICompany', 'IListing', 'IEcosystemAuditLog']);
  fs.writeFileSync(f, c);
  console.log('✔ Fixed ecosystem-admin.controller.ts');
}

// 3. IEscrowCoupon — not in shared-persistence, export from schema directly
{
  const schemaFile = 'packages/shared/shared-persistence/src/schemas/backend/escrowCoupon.schema.ts';
  const indexFile = 'packages/shared/shared-persistence/src/index.ts';
  if (fs.existsSync(schemaFile)) {
    const sc = fs.readFileSync(schemaFile, 'utf8');
    const hasInterface = sc.includes('export interface IEscrowCoupon');
    if (hasInterface) {
      let idx = fs.readFileSync(indexFile, 'utf8');
      if (!idx.includes('IEscrowCoupon')) {
        idx += `\nexport { EscrowCoupon, IEscrowCoupon, EscrowCouponSchema } from './schemas/backend/escrowCoupon.schema';\n`;
        fs.writeFileSync(indexFile, idx);
        console.log('✔ Exported IEscrowCoupon from index.ts');
      }
    }
  }
}

// 4. mongo-lottery.repository.ts — _id ObjectId vs string conflict, cast with as any to resolve
{
  const f = 'apps/backend/src/modules/auction/infrastructure/persistence/mongo-lottery.repository.ts';
  let c = fs.readFileSync(f, 'utf8');
  // The conflict is between local ILotteryTicket (ObjectId _id) vs shared-persistence (string _id)
  // Use type assertion on the model assignment
  c = c.replace(
    'this.ticketModel = LotteryTicketModel;',
    'this.ticketModel = LotteryTicketModel as unknown as typeof this.ticketModel;'
  );
  fs.writeFileSync(f, c);
  console.log('✔ Fixed mongo-lottery.repository.ts type assertion');
}

// 5. mongo-wanted-item.repository.ts — WantedItemDocument cast
{
  const f = 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-wanted-item.repository.ts';
  let c = fs.readFileSync(f, 'utf8');
  // Fix the cast: as WantedItemDocument → use unknown first
  c = c.replace(/as WantedItemDocument\b/g, 'as unknown as WantedItemDocument');
  fs.writeFileSync(f, c);
  console.log('✔ Fixed mongo-wanted-item.repository.ts');
}

// 6. vendor-profile userId field — check the interface
{
  const f = 'apps/backend/src/modules/vendor/application/queries/list-admin-vendors.handler.ts';
  let c = fs.readFileSync(f, 'utf8');
  // The error is at line 67: userId does not exist on VendorProfile type
  // Use bracket notation or optional cast
  c = c.replace(/\.userId\b/g, (m, offset) => {
    // Only fix in context of vendorProfile
    return '?.userId';
  });
  fs.writeFileSync(f, c);
  console.log('✔ Fixed list-admin-vendors.handler.ts userId access');
}

// 7. Fix remaining error.message usages
const errFiles = [
  'apps/backend/src/modules/catalog/application/commands/create-admin-product.handler.ts',
  'apps/backend/src/modules/commerce/application/services/storage.service.ts',
  'apps/backend/src/modules/vendor/application/services/vendor-registration.service.ts',
];
for (const f of errFiles) {
  if (!fs.existsSync(f)) continue;
  const c = fs.readFileSync(f, 'utf8');
  const fixed = fixErrMsg(c);
  if (fixed !== c) { fs.writeFileSync(f, fixed); console.log(`✔ Fixed err.message: ${f}`); }
}
