// apps/backend/src/modules/vendor/application/commands/bulk-import-vendor-products.command.ts
// rows: FileParserService tarafından üretilen ham satırlar (XLSX.utils.sheet_to_json çıktısı).
// ColumnResolverService handler içinde bu ham satırları whitelist üzerinden filtreler.

export class BulkImportVendorProductsCommand {
  constructor(
    public readonly vendorId: string,
    /** Ham Excel/CSV satırları — kolon adları normalize edilmemiş, whitelist uygulanmamış */
    public readonly rows: Record<string, unknown>[],
  ) {}
}
