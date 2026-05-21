const fs = require('fs');

// 1. surplus.controller.ts — remove duplicate direct schema import
{
  const f = 'apps/backend/src/modules/barter/presentation/surplus.controller.ts';
  let c = fs.readFileSync(f, 'utf8');
  // Remove the direct schema path import
  c = c.replace(/import \{ ICompany \} from '\.\.\/.*company\.schema';\n?/, '');
  fs.writeFileSync(f, c);
  console.log('✔ Fixed surplus.controller.ts');
}

// 2. create-admin-product.handler.ts line 62 — error.code access on unknown
{
  const f = 'apps/backend/src/modules/catalog/application/commands/create-admin-product.handler.ts';
  let c = fs.readFileSync(f, 'utf8');
  // The fix kept nesting error.message multiple times — need to clean it
  // Also error.code is invalid on unknown — cast to any for this MongoError check
  c = c.replace(
    /if \(error\.code[^)]+\).*?\.includes\('slug'\)\)/s,
    `if ((error as { code?: number; message?: string }).code === 11000 && String((error as { message?: string }).message ?? '').includes('slug'))`
  );
  fs.writeFileSync(f, c);
  console.log('✔ Fixed create-admin-product.handler.ts');
}

// 3. storage.service.ts line 83 — err.code on unknown
{
  const f = 'apps/backend/src/modules/commerce/application/services/storage.service.ts';
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(
    "if (err.code === 'NoSuchKey') return null;",
    "if ((err as { code?: string }).code === 'NoSuchKey') return null;"
  );
  fs.writeFileSync(f, c);
  console.log('✔ Fixed storage.service.ts');
}

// 4. vendor-registration.service.ts line 84 — error.stack on unknown
{
  const f = 'apps/backend/src/modules/vendor/application/services/vendor-registration.service.ts';
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(
    "this.logger.error('Vendor Atomic Application Error', error.stack)",
    "this.logger.error('Vendor Atomic Application Error', error instanceof Error ? error.stack : String(error))"
  );
  fs.writeFileSync(f, c);
  console.log('✔ Fixed vendor-registration.service.ts');
}

// 5. list-admin-vendors.handler.ts — p?.userId on IVendorProfile (no userId field)
{
  const f = 'apps/backend/src/modules/vendor/application/queries/list-admin-vendors.handler.ts';
  let c = fs.readFileSync(f, 'utf8');
  // userId doesn't exist on VendorProfile — remove it from the Map key
  c = c.replace(
    /\[p\.vendorId \|\| p\?\.userId,/,
    '[p.vendorId,'
  );
  fs.writeFileSync(f, c);
  console.log('✔ Fixed list-admin-vendors.handler.ts');
}
