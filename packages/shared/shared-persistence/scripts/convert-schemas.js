const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, '../src/schemas/backend'),
  path.join(__dirname, '../src/schemas/financial')
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.schema.ts'));
  console.log(`Processing ${files.length} files in ${dir}...`);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const hasProxyCall = content.includes('createModelProxy');
    const hasProxyImport = content.includes("import { createModelProxy }");

    if (hasProxyCall && !hasProxyImport) {
      content = `import { createModelProxy } from '../../mongodb/model-proxy';\n` + content;
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Added import to: ${file}`);
    }
  });
});
