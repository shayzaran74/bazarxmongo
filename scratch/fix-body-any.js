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

  // Replace @Body() dto: any with @Body() dto: Record<string, any>
  content = content.replace(/@Body\(\)\s+(\w+):\s*any/g, '@Body() $1: Record<string, any>');
  // Replace @Req() req: any with @Req() req: Record<string, any>
  content = content.replace(/@Req\(\)\s+(\w+):\s*any/g, '@Req() $1: Record<string, any>');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Fixed @Body any in: ${file}`);
  }
});

console.log(`Total files updated: ${changedFiles}`);
