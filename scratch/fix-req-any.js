const fs = require('fs');
const path = require('path');

const filesToFix = [
  'apps/backend/src/modules/identity/google-oauth.controller.ts',
  'apps/backend/src/modules/identity/address.controller.ts',
  'apps/backend/src/modules/identity/user.controller.ts',
  'apps/backend/src/modules/identity/auth.controller.ts'
];

for (const f of filesToFix) {
  let c = fs.readFileSync(path.join(__dirname, '../', f), 'utf8');
  let originalContent = c;

  // 1. If it's address.controller or user.controller, or 'me' in auth.controller, replace @Req() req: Record<string, any> with @CurrentUser() user: AuthenticatedUser
  if (f.includes('address.controller.ts') || f.includes('user.controller.ts')) {
    c = c.replace(/@Req\(\)\s+req:\s*Record<string,\s*any>/g, '@CurrentUser() user: AuthenticatedUser');
    c = c.replace(/req\.user/g, 'user');
    
    if (!c.includes('CurrentUser')) {
      c = `import { CurrentUser } from '@barterborsa/shared-nest';\n` + c;
    }
    if (!c.includes('interface AuthenticatedUser')) {
      c += `\nexport interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }\n`;
    }
  }

  if (f.includes('auth.controller.ts')) {
    // Specifically target 'me'
    c = c.replace(/async\s+me\(@Req\(\)\s+req:\s*Record<string,\s*any>\)\s*{/, 'async me(@CurrentUser() user: AuthenticatedUser) {');
    // For 'me' body, replace req.user with user
    c = c.replace(/req\.user/g, 'user');
    
    // For others (login, register, refresh) in auth.controller, use @Req() req: Request
    c = c.replace(/@Req\(\)\s+req:\s*Record<string,\s*any>/g, '@Req() req: Request');
    // Ensure Request from express is imported
    if (!c.includes('import { Request } from \'express\'') && !c.includes('import { Request, Response } from \'express\'')) {
       c = c.replace('import { Response } from \'express\';', 'import { Request, Response } from \'express\';');
    }
    
    if (!c.includes('CurrentUser')) {
      c = `import { CurrentUser } from '@barterborsa/shared-nest';\n` + c;
    }
    if (!c.includes('interface AuthenticatedUser')) {
      c += `\nexport interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }\n`;
    }
  }

  if (f.includes('google-oauth.controller.ts')) {
    c = c.replace(/@Req\(\)\s+req:\s*Record<string,\s*any>/g, '@Req() req: Request');
    if (!c.includes('import { Request }')) {
      c = `import { Request } from 'express';\n` + c;
    }
  }

  if (c !== originalContent) {
    fs.writeFileSync(path.join(__dirname, '../', f), c, 'utf8');
    console.log(`Fixed ${f}`);
  }
}
