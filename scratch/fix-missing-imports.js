const fs = require('fs');

// Interface → hangi schema dosyasından geldiği
const SCHEMA_FILE = {
  'ICoupon':         'packages/shared/shared-persistence/src/schemas/backend/coupon.schema.ts',
  'IUserAddress':    'packages/shared/shared-persistence/src/schemas/backend/userAddress.schema.ts',
  'ICategory':       'packages/shared/shared-persistence/src/schemas/backend/category.schema.ts',
  'IWantedItem':     'packages/shared/shared-persistence/src/schemas/backend/wantedItem.schema.ts',
  'IUserLevel':      'packages/shared/shared-persistence/src/schemas/backend/userLevel.schema.ts',
  'ISurplusCategory':'packages/shared/shared-persistence/src/schemas/backend/surplusCategory.schema.ts',
  'ICompany':        'packages/shared/shared-persistence/src/schemas/backend/company.schema.ts',
  'IReferral':       'packages/shared/shared-persistence/src/schemas/backend/referral.schema.ts',
  'ITransfer':       'packages/shared/shared-persistence/src/schemas/backend/transfer.schema.ts',
  'ITransferItem':   'packages/shared/shared-persistence/src/schemas/backend/transferItem.schema.ts',
  'IUser':           'packages/shared/shared-persistence/src/schemas/backend/user.schema.ts',
};

// Check which interfaces are actually exported from @barterborsa/shared-persistence index
const indexContent = fs.readFileSync('packages/shared/shared-persistence/src/index.ts', 'utf8');

const fixes = [
  { file: 'apps/backend/src/modules/commerce/infrastructure/persistence/mongo-coupon.repository.ts', iface: 'ICoupon' },
  { file: 'apps/backend/src/modules/commerce/infrastructure/persistence/mongo-user-address.repository.ts', iface: 'IUserAddress' },
  { file: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-category.repository.ts', iface: 'ICategory' },
  { file: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-wanted-item.repository.ts', iface: 'IWantedItem' },
  { file: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-user-level.repository.ts', iface: 'IUserLevel' },
  { file: 'apps/backend/src/modules/barter/presentation/surplus.controller.ts', ifaceList: ['ISurplusCategory', 'ICompany'] },
  { file: 'apps/backend/src/modules/identity/application/queries/list-admin-users.handler.ts', iface: 'ICompany' },
  { file: 'apps/backend/src/modules/identity/infrastructure/persistence/mongo-referral.repository.ts', iface: 'IReferral' },
  { file: 'apps/backend/src/modules/identity/infrastructure/persistence/mongo-user.repository.ts', iface: 'IUser' },
  { file: 'apps/backend/src/modules/inventory/infrastructure/persistence/mongo-transfer.repository.ts', ifaceList: ['ITransfer', 'ITransferItem'] },
];

for (const fix of fixes) {
  if (!fs.existsSync(fix.file)) continue;
  let c = fs.readFileSync(fix.file, 'utf8');
  const ifaces = fix.ifaceList || [fix.iface];
  
  for (const iface of ifaces) {
    if (c.includes(iface) && !c.includes(`import { ${iface}`)) {
      // Check if exported from main index
      if (indexContent.includes(`'${iface}'`) || indexContent.includes(` ${iface},`) || indexContent.includes(` ${iface} }`)) {
        // Add to existing @barterborsa/shared-persistence import or create new
        const existingImport = /import \{([^}]+)\} from '@barterborsa\/shared-persistence';/;
        if (existingImport.test(c)) {
          c = c.replace(existingImport, (m, items) => {
            const arr = items.split(',').map(s => s.trim()).filter(Boolean);
            if (!arr.includes(iface)) arr.push(iface);
            return `import { ${arr.join(', ')} } from '@barterborsa/shared-persistence';`;
          });
        } else {
          // Find schema path and add direct import
          const schemaPath = SCHEMA_FILE[iface];
          if (schemaPath && fs.existsSync(schemaPath)) {
            // Calculate relative path
            const fileParts = fix.file.split('/');
            const schemaParts = schemaPath.split('/');
            // count common prefix
            let commonLen = 0;
            while (commonLen < fileParts.length - 1 && commonLen < schemaParts.length && fileParts[commonLen] === schemaParts[commonLen]) commonLen++;
            const ups = (fileParts.length - 1 - commonLen);
            const relPath = '../'.repeat(ups) + schemaParts.slice(commonLen).join('/').replace('.ts', '');
            c = `import { ${iface} } from '${relPath}';\n` + c;
          } else {
            c = `import { ${iface} } from '@barterborsa/shared-persistence';\n` + c;
          }
        }
      }
    }
  }
  
  fs.writeFileSync(fix.file, c);
  console.log(`✔ Import fixed: ${fix.file}`);
}
