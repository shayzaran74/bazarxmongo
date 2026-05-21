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

  // Replace @CurrentUser() user: any with @CurrentUser() user: AuthenticatedUser
  const regex = /@CurrentUser\(\)\s+(\w+):\s*any/g;
  if (regex.test(content)) {
    content = content.replace(regex, '@CurrentUser() $1: AuthenticatedUser');
    
    // Check if AuthenticatedUser is imported or defined
    if (!content.includes('AuthenticatedUser')) {
       // Should not happen since we just added it, but let's check for "interface AuthenticatedUser"
    }
    
    if (!content.includes('interface AuthenticatedUser')) {
      content += `\nexport interface AuthenticatedUser { id: string; role: string; }\n`;
    }
    
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Fixed: ${file}`);
  }
});

console.log(`Total files fixed: ${changedFiles}`);
