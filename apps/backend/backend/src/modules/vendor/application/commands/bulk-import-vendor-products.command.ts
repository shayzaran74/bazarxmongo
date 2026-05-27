// apps/backend/src/modules/vendor/application/commands/bulk-import-vendor-products.command.ts

import { ParsedRow } from '../services/file-parser.service';

export class BulkImportVendorProductsCommand {
  constructor(
    public readonly vendorId: string,
    public readonly rows: ParsedRow[],
  ) {}
}
