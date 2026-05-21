const fs = require('fs');

// Şema → Interface eşleme tablosu
const MODEL_TO_INTERFACE = {
  'User':              { iface: 'IUser',             pkg: '@barterborsa/shared-persistence' },
  'UserProfile':       { iface: 'IUserProfile',       pkg: '@barterborsa/shared-persistence' },
  'UserAddress':       { iface: 'IUserAddress',       pkg: '@barterborsa/shared-persistence' },
  'Vendor':            { iface: 'IVendor',            pkg: '@barterborsa/shared-persistence' },
  'VendorProfile':     { iface: 'IVendorProfile',     pkg: '@barterborsa/shared-persistence' },
  'VendorCategory':    { iface: 'IVendorCategory',    pkg: '@barterborsa/shared-persistence' },
  'Company':           { iface: 'ICompany',           pkg: '@barterborsa/shared-persistence' },
  'Category':          { iface: 'ICategory',          pkg: '@barterborsa/shared-persistence' },
  'Listing':           { iface: 'IListing',           pkg: '@barterborsa/shared-persistence' },
  'SurplusCategory':   { iface: 'ISurplusCategory',   pkg: '@barterborsa/shared-persistence' },
  'BadgeRule':         { iface: 'IBadgeRule',         pkg: '@barterborsa/shared-persistence' },
  'EcosystemAuditLog': { iface: 'IEcosystemAuditLog', pkg: '@barterborsa/shared-persistence' },
  'Coupon':            { iface: 'ICoupon',             pkg: '@barterborsa/shared-persistence' },
  'Referral':          { iface: 'IReferral',           pkg: '@barterborsa/shared-persistence' },
  'Transfer':          { iface: 'ITransfer',           pkg: '@barterborsa/shared-persistence' },
  'TransferItem':      { iface: 'ITransferItem',       pkg: '@barterborsa/shared-persistence' },
  'LotteryTicket':     { iface: 'ILotteryTicket',      pkg: '@barterborsa/shared-persistence' },
  'WantedItem':        { iface: 'IWantedItem',         pkg: '@barterborsa/shared-persistence' },
  'UserLevel':         { iface: 'IUserLevel',          pkg: '@barterborsa/shared-persistence' },
  'VendorB2BData':     { iface: 'IVendorB2BData',      pkg: '@barterborsa/shared-persistence' },
};

const files = [
  'apps/backend/src/modules/commerce/infrastructure/persistence/mongo-coupon.repository.ts',
  'apps/backend/src/modules/commerce/infrastructure/persistence/mongo-user-address.repository.ts',
  'apps/backend/src/modules/auction/infrastructure/persistence/mongo-lottery.repository.ts',
  'apps/backend/src/modules/identity/application/queries/list-admin-users.handler.ts',
  'apps/backend/src/modules/identity/infrastructure/persistence/mongo-referral.repository.ts',
  'apps/backend/src/modules/identity/infrastructure/persistence/mongo-user.repository.ts',
  'apps/backend/src/modules/barter/infrastructure/persistence/mongo-category.repository.ts',
  'apps/backend/src/modules/barter/infrastructure/persistence/mongo-wanted-item.repository.ts',
  'apps/backend/src/modules/barter/infrastructure/persistence/mongo-vendor-b2b-data.repository.ts',
  'apps/backend/src/modules/barter/infrastructure/persistence/mongo-user-level.repository.ts',
  'apps/backend/src/modules/barter/presentation/surplus.controller.ts',
  'apps/backend/src/modules/loyalty/presentation/badge-admin.controller.ts',
  'apps/backend/src/modules/inventory/infrastructure/persistence/mongo-transfer.repository.ts',
  'apps/backend/src/modules/vendor/application/queries/list-admin-vendors.handler.ts',
  'apps/backend/src/modules/vendor/presentation/ecosystem-admin.controller.ts',
];

let totalFixed = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  const original = c;
  const neededImports = new Set();

  // InjectModel patterns: @InjectModel('ModelName') ... Model<any>
  c = c.replace(/@InjectModel\('(\w+)'\)[^:]+:\s*Model<any>/g, (match, modelName) => {
    const entry = MODEL_TO_INTERFACE[modelName];
    if (entry) {
      neededImports.add(`${entry.iface}|${entry.pkg}`);
      return match.replace('Model<any>', `Model<${entry.iface}>`);
    }
    return match;
  });

  // private readonly model/itemModel etc: Model<any>
  // Look at the @InjectModel on same or nearby line — fallback: leave as document
  c = c.replace(/private readonly (\w+)Model:\s*Model<any>/g, (match, prefix) => {
    const key = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const entry = MODEL_TO_INTERFACE[key];
    if (entry) {
      neededImports.add(`${entry.iface}|${entry.pkg}`);
      return match.replace('Model<any>', `Model<${entry.iface}>`);
    }
    // repo-level: use Document as safe fallback
    return match.replace('Model<any>', 'Model<Document>');
  });

  // plain "private readonly model: Model<any>" in repos — check filename for clue
  if (c.includes('private readonly model: Model<any>')) {
    const fname = f.split('/').pop() || '';
    let hint = '';
    if (fname.includes('user.')) hint = 'User';
    else if (fname.includes('coupon.')) hint = 'Coupon';
    else if (fname.includes('referral.')) hint = 'Referral';
    else if (fname.includes('transfer.')) hint = 'Transfer';
    else if (fname.includes('wanted-item.')) hint = 'WantedItem';
    else if (fname.includes('category.')) hint = 'Category';
    else if (fname.includes('user-level.')) hint = 'UserLevel';
    else if (fname.includes('vendor-b2b.')) hint = 'VendorB2BData';
    else if (fname.includes('user-address.')) hint = 'UserAddress';

    const entry = hint ? MODEL_TO_INTERFACE[hint] : null;
    if (entry) {
      neededImports.add(`${entry.iface}|${entry.pkg}`);
      c = c.replace(/private readonly model: Model<any>/g, `private readonly model: Model<${entry.iface}>`);
    } else {
      c = c.replace(/private readonly model: Model<any>/g, 'private readonly model: Model<Document>');
    }
  }

  // Inject needed imports
  for (const imp of neededImports) {
    const [iface, pkg] = imp.split('|');
    if (!c.includes(iface)) {
      // Add import after first existing import from that package, or at top
      const existingImport = new RegExp(`import \\{([^}]+)\\} from '${pkg.replace('/', '\\/')}';`);
      if (existingImport.test(c)) {
        c = c.replace(existingImport, (m, items) => {
          const itemsArr = items.split(',').map(i => i.trim());
          if (!itemsArr.includes(iface)) itemsArr.push(iface);
          return `import { ${itemsArr.join(', ')} } from '${pkg}';`;
        });
      } else {
        c = `import { ${iface} } from '${pkg}';\n` + c;
      }
    }
  }

  if (c !== original) {
    fs.writeFileSync(f, c);
    totalFixed++;
    console.log(`✔ Fixed: ${f}`);
  }
}
console.log(`\nTotal files updated: ${totalFixed}`);
