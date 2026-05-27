export class BulkUpdateAdminProductsCommand {
  constructor(
    public readonly ids: string[],
    public readonly updates: {
      status?: string;
      isActive?: boolean | string;
      isFeatured?: boolean | string;
      isFlashSale?: boolean | string;
      isSpecialOffer?: boolean | string;
    }
  ) {}
}
