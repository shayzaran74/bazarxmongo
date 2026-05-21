const fs = require('fs');

// These files have Model<IFoo> but missing the import statement
const fixes = [
  { file: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-category.repository.ts',   iface: 'ICategory' },
  { file: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-wanted-item.repository.ts', iface: 'IWantedItem' },
  { file: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-user-level.repository.ts',  iface: 'IUserLevel' },
  { file: 'apps/backend/src/modules/commerce/infrastructure/persistence/mongo-coupon.repository.ts',    iface: 'ICoupon' },
  { file: 'apps/backend/src/modules/commerce/infrastructure/persistence/mongo-user-address.repository.ts', iface: 'IUserAddress' },
  { file: 'apps/backend/src/modules/identity/infrastructure/persistence/mongo-referral.repository.ts',  iface: 'IReferral' },
  { file: 'apps/backend/src/modules/identity/infrastructure/persistence/mongo-user.repository.ts',      iface: 'IUser' },
  { file: 'apps/backend/src/modules/inventory/infrastructure/persistence/mongo-transfer.repository.ts', iface: 'ITransfer' },
];

for (const { file, iface } of fixes) {
  if (!fs.existsSync(file)) continue;
  let c = fs.readFileSync(file, 'utf8');
  
  // Check if it has the interface but NO import statement for it
  const hasUsage = c.includes(`Model<${iface}>`);
  const hasImport = new RegExp(`import[^;\\n]*\\b${iface}\\b[^;\\n]*from`).test(c);
  
  if (hasUsage && !hasImport) {
    // Insert import right after the "import { Model } from 'mongoose';" line
    c = c.replace(
      `import { Model } from 'mongoose';`,
      `import { Model } from 'mongoose';\nimport { ${iface} } from '@barterborsa/shared-persistence';`
    );
    fs.writeFileSync(file, c);
    console.log(`✔ Inserted import for ${iface} in ${file}`);
  } else if (!hasUsage) {
    console.log(`  (not used) ${iface} in ${file}`);
  } else {
    console.log(`  (already imported) ${iface} in ${file}`);
  }
}

// ITransferItem in transfer repo
{
  const file = 'apps/backend/src/modules/inventory/infrastructure/persistence/mongo-transfer.repository.ts';
  let c = fs.readFileSync(file, 'utf8');
  if (c.includes('Model<ITransferItem>') && !c.match(/import[^;]*ITransferItem[^;]*from/)) {
    c = c.replace(
      /import \{ ITransfer \} from '@barterborsa\/shared-persistence';/,
      `import { ITransfer, ITransferItem } from '@barterborsa/shared-persistence';`
    );
    fs.writeFileSync(file, c);
    console.log('✔ Added ITransferItem to transfer repo');
  }
}
