// apps/backend/src/modules/catalog/application/commands/queue-import-products.command.ts

export class QueueImportProductsCommand {
  constructor(
    public readonly rows: any[],
    public readonly adminId: string,
    public readonly vendorType: string = 'COMMERCE',
  ) {}
}
