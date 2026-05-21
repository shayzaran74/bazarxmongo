const fs = require('fs');
const path = require('path');

const files = [
  'apps/backend/src/modules/analytics/domain/entities/analytics.entities.ts',
  'apps/backend/src/modules/loyalty/domain/entities/missions-milestones.entities.ts',
  'apps/backend/src/modules/loyalty/domain/entities/loyalty-misc.entities.ts',
  'apps/backend/src/modules/communication/application/commands/create-notification.command.ts',
  'apps/backend/src/modules/loyalty/application/commands/earn-xp.command.ts',
  'apps/backend/src/modules/communication/domain/entities/notification.entity.ts',
  'apps/backend/src/modules/communication/domain/entities/chat-message.entity.ts',
  'apps/backend/src/modules/commerce/domain/entities/invoice.entity.ts',
  'apps/backend/src/modules/catalog/domain/entities/catalog-product.entity.ts',
  'apps/backend/src/modules/catalog/domain/entities/listing.entity.ts'
];

for (const file of files) {
  const fullPath = path.join(__dirname, '../', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    const newContent = content.replace(/metadata\??:\s*any/g, 'metadata?: Record<string, unknown>');
    if (content !== newContent) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}
