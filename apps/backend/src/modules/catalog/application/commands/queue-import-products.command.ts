// apps/backend/src/modules/catalog/application/commands/queue-import-products.command.ts

export interface ImportProductRow {
  [key: string]: unknown;
  name?: string;
  title?: string;
  description?: string;
  brandName?: string;
  barcode?: string;
  gtin?: string;
  categoryId?: string;
  price?: string | number;
  stock?: string | number;
  sku?: string;
  status?: string;
  isFeatured?: string;
  isSpecialOffer?: string;
}

export class QueueImportProductsCommand {
  constructor(
    public readonly rows: unknown[],
    public readonly adminId: string,
    public readonly vendorType: string = 'COMMERCE',
  ) {}
}
