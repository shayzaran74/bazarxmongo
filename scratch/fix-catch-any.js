const fs = require('fs');
const files = [
  'apps/backend/src/common/resilience/circuit-breaker.service.ts',
  'apps/backend/src/modules/commerce/application/services/order-escrow-worker.service.ts',
  'apps/backend/src/modules/commerce/application/services/storage.service.ts',
  'apps/backend/src/modules/commerce/infrastructure/persistence/mappers/order.mapper.ts',
  'apps/backend/src/modules/identity/identity.module.ts',
  'apps/backend/src/modules/catalog/application/commands/create-admin-product.handler.ts',
  'apps/backend/src/modules/catalog/application/commands/bulk-delete-admin-products.handler.ts',
  'apps/backend/src/modules/audit/presentation/logs-admin.controller.ts',
  'apps/backend/src/modules/inventory/presentation/inventory-admin.controller.ts',
  'apps/backend/src/modules/inventory/presentation/vendor-inventory.controller.ts',
  'apps/backend/src/modules/communication/application/event-handlers/user-registered-notification.handler.ts',
  'apps/backend/src/modules/vendor/application/services/vendor-registration.service.ts',
];

let totalFixed = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  const original = c;
  // catch (error: any) → catch (error: unknown)
  c = c.replace(/} catch \(error: any\)/g, '} catch (error: unknown)');
  c = c.replace(/} catch \(err: any\)/g,   '} catch (err: unknown)');
  c = c.replace(/} catch \(e: any\)/g,      '} catch (e: unknown)');
  // Fix usages: error.message → (error as Error).message
  // Only if in a block that NOW has unknown
  c = c.replace(/catch \(error: unknown\) \{([^}]*?)error\.message/gs, (m, body) =>
    m.replace('error.message', '(error instanceof Error ? error.message : String(error))')
  );
  c = c.replace(/catch \(err: unknown\) \{([^}]*?)err\.message/gs, (m, body) =>
    m.replace('err.message', '(err instanceof Error ? err.message : String(err))')
  );
  c = c.replace(/catch \(e: unknown\) \{([^}]*?)e\.message/gs, (m, body) =>
    m.replace('e.message', '(e instanceof Error ? e.message : String(e))')
  );
  if (c !== original) {
    fs.writeFileSync(f, c);
    totalFixed++;
    console.log(`✔ Fixed: ${f}`);
  }
}
console.log(`\nTotal files updated: ${totalFixed}`);
