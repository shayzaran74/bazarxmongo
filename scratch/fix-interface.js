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

  // Replace exact export interface
  const searchStr1 = "export interface AuthenticatedUser { id: string; role: string; }";
  const searchStr2 = "export interface AuthenticatedUser { id: string; role: string }";
  const replacement = "export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }";
  
  if (content.includes(searchStr1)) {
    content = content.replace(searchStr1, replacement);
  }
  if (content.includes(searchStr2)) {
    content = content.replace(searchStr2, replacement);
  }
  
  // What if it is not exported, like in vendor-admin.controller.ts
  const searchStr3 = "interface AuthenticatedUser {\n  id: string;\n  role: string;\n}";
  const replacement3 = "interface AuthenticatedUser {\n  id: string;\n  role: string;\n  vendorId?: string;\n  firstName?: string;\n  lastName?: string;\n}";
  
  if (content.includes(searchStr3)) {
    content = content.replace(searchStr3, replacement3);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated interface in: ${file}`);
  }
});

console.log(`Total files updated: ${changedFiles}`);
