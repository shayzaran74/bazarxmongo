const fs = require('fs');

const filesToFix = [
  'apps/backend/src/modules/catalog/presentation/buybox.controller.ts',
  'apps/backend/src/modules/commerce/presentation/einvoice.controller.ts',
  'apps/backend/src/modules/commerce/presentation/return.controller.ts',
  'apps/backend/src/modules/delivery/presentation/cargo-tracking.controller.ts',
  'apps/backend/src/modules/vendor/presentation/early-payment.controller.ts',
  'apps/backend/src/modules/vendor/presentation/vendor-score.controller.ts'
];

for (const f of filesToFix) {
  let c = fs.readFileSync(f, 'utf8');
  
  // 1. Add import { CurrentUser } from '@barterborsa/shared-nest';
  if (!c.includes('import { CurrentUser }')) {
    c = `import { CurrentUser } from '@barterborsa/shared-nest';\n` + c;
  }
  
  // 2. Fix user.vendorId undefined errors
  c = c.replace(/user\.vendorId\b/g, 'user.vendorId!');
  
  // 3. Fix req.body in vendor-score.controller.ts
  if (f.includes('vendor-score.controller.ts')) {
    // If it uses req.body, but req is not defined, we should inject @Body() body: any
    if (c.includes('req.body')) {
      // Find the method signature and add @Body() body: any
      c = c.replace(/async\s+(\w+)\s*\((.*?)\)\s*{/, 'async $1($2, @Body() body: any) {');
      c = c.replace(/req\.body/g, 'body');
    }
  }

  fs.writeFileSync(f, c, 'utf8');
  console.log(`Fixed ${f}`);
}
