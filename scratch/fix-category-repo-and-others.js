const fs = require('fs');

// 1. Fix mongo-category.repository.ts — Promise<I | null> broken → should be ISurplusCategory
{
  const f = 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-category.repository.ts';
  let c = fs.readFileSync(f, 'utf8');
  // Remove unused ICategory import
  c = c.replace(/import \{ ICategory, ISurplusCategory \} from/, 'import { ISurplusCategory } from');
  // Fix broken Promise<I | null> (script broke it by replacing ISurplusCategory partially)
  c = c.replace('Promise< | null>', 'Promise<ISurplusCategory | null>');
  fs.writeFileSync(f, c);
  console.log('✔ Fixed mongo-category.repository.ts');
}

// 2. Fix surplus.controller.ts — deduplicate ICompany import
{
  const f = 'apps/backend/src/modules/barter/presentation/surplus.controller.ts';
  let c = fs.readFileSync(f, 'utf8');
  // Find and deduplicate all @barterborsa/shared-persistence imports
  const allImports = new Set();
  c = c.replace(/import \{([^}]+)\} from '@barterborsa\/shared-persistence';/g, (m, items) => {
    items.split(',').map(s => s.trim()).filter(Boolean).forEach(i => allImports.add(i));
    return '___REMOVE___';
  });
  c = c.replace(/___REMOVE___\n?/g, '');
  c = `import { ${[...allImports].join(', ')} } from '@barterborsa/shared-persistence';\n` + c.replace(/^\n+/, '');
  fs.writeFileSync(f, c);
  console.log('✔ Fixed surplus.controller.ts (dedup)');
}

// 3. create-admin-product.handler.ts and storage.service.ts — check exact lines
const errFiles = [
  'apps/backend/src/modules/catalog/application/commands/create-admin-product.handler.ts',
  'apps/backend/src/modules/commerce/application/services/storage.service.ts',
  'apps/backend/src/modules/vendor/application/services/vendor-registration.service.ts',
];
for (const f of errFiles) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  const original = c;
  // Look for any remaining error.message / err.message that wasn't wrapped
  c = c.replace(/(?<!\(error instanceof Error \? error\.message : String\(error\)\))\berror\.message\b/g,
    '(error instanceof Error ? error.message : String(error))');
  c = c.replace(/(?<!\(err instanceof Error \? err\.message : String\(err\)\))\berr\.message\b/g,
    '(err instanceof Error ? err.message : String(err))');
  if (c !== original) { fs.writeFileSync(f, c); console.log(`✔ Fixed err.message: ${f}`); }
}

// 4. list-admin-vendors.handler.ts — vendorProfile.userId does not exist
{
  const f = 'apps/backend/src/modules/vendor/application/queries/list-admin-vendors.handler.ts';
  let c = fs.readFileSync(f, 'utf8');
  // Check line 67 context
  const lines = c.split('\n');
  const line67 = lines[66] || '';
  console.log('Line 67:', line67.trim());
  // Fix: cast to any for this property access or use type guard
  c = c.replace(/(\w+Profile)\.userId\b/g, '($1 as unknown as { userId?: string }).userId');
  fs.writeFileSync(f, c);
  console.log('✔ Fixed list-admin-vendors userId access');
}
