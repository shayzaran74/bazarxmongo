const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else callback(p);
  });
}

const backendSrc = path.join(__dirname, '../apps/backend/src');
let changedFiles = 0;

walk(backendSrc, (file) => {
  if (!file.endsWith('.ts')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  if (content.includes('@Request() req: any')) {
    // 1. Replace @Request() req: any with @CurrentUser() user: AuthenticatedUser
    content = content.replace(/@Request\(\)\s+req:\s*any/g, '@CurrentUser() user: AuthenticatedUser');
    
    // 2. Replace usages of req.user with user
    content = content.replace(/req\.user/g, 'user');

    // 3. Import CurrentUser and AuthenticatedUser if not present
    if (!content.includes('CurrentUser')) {
      // Find the last import from @nestjs/common or similar and add import { CurrentUser } from '@barterborsa/shared-nest';
      content = `import { CurrentUser } from '@barterborsa/shared-nest';\n` + content;
    }
    
    if (!content.includes('interface AuthenticatedUser')) {
      content += `\nexport interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }\n`;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Fixed @Request in: ${file}`);
  }
});

console.log(`Total files updated: ${changedFiles}`);
