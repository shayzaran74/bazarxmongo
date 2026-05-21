const fs = require('fs');

// Files that need direct imports from shared-persistence (script added import at wrong position)
const fixes = [
  { file: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-category.repository.ts', iface: 'ICategory' },
  { file: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-wanted-item.repository.ts', iface: 'IWantedItem' },
  { file: 'apps/backend/src/modules/barter/infrastructure/persistence/mongo-user-level.repository.ts', iface: 'IUserLevel' },
  { file: 'apps/backend/src/modules/barter/presentation/surplus.controller.ts', iface: 'ISurplusCategory' },
  { file: 'apps/backend/src/modules/commerce/infrastructure/persistence/mongo-coupon.repository.ts', iface: 'ICoupon' },
  { file: 'apps/backend/src/modules/commerce/infrastructure/persistence/mongo-user-address.repository.ts', iface: 'IUserAddress' },
  { file: 'apps/backend/src/modules/identity/infrastructure/persistence/mongo-referral.repository.ts', iface: 'IReferral' },
  { file: 'apps/backend/src/modules/identity/infrastructure/persistence/mongo-user.repository.ts', iface: 'IUser' },
  { file: 'apps/backend/src/modules/inventory/infrastructure/persistence/mongo-transfer.repository.ts', iface: 'ITransfer' },
];

for (const { file, iface } of fixes) {
  if (!fs.existsSync(file)) continue;
  let c = fs.readFileSync(file, 'utf8');
  
  // If interface is used but not imported, add import after the "import { Injectable }" line
  if (c.includes(iface) && !c.includes(`'${iface}'`) && !c.match(new RegExp(`import[^;]*${iface}[^;]*from`))) {
    c = c.replace(
      `import { Injectable } from '@nestjs/common';`,
      `import { Injectable } from '@nestjs/common';\nimport { ${iface} } from '@barterborsa/shared-persistence';`
    );
    fs.writeFileSync(file, c);
    console.log(`✔ Added import ${iface} to ${file}`);
  } else {
    console.log(`- Already has ${iface}: ${file}`);
  }
}

// Fix ICompany in surplus controller
{
  const f = 'apps/backend/src/modules/barter/presentation/surplus.controller.ts';
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('ICompany') && !c.match(/import[^;]*ICompany[^;]*from/)) {
    c = c.replace(
      /import \{ ([^}]+) \} from '@barterborsa\/shared-persistence';/,
      (m, items) => `import { ${items.trim()}, ICompany } from '@barterborsa/shared-persistence';`
    );
    fs.writeFileSync(f, c);
    console.log('✔ Added ICompany to surplus.controller.ts');
  }
}
