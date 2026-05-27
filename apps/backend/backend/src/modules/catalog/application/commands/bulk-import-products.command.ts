export interface BulkImportProductRow {
  name?: string;
  title?: string;
  description?: string;
  price?: number | string;
  stock?: number | string;
  sku?: string;
  gtin?: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string;
  brandName?: string;
  status?: string;
  isFeatured?: boolean | string;
  isSpecialOffer?: boolean | string;
  isFlashSale?: boolean | string;
  productImages?: string[];
}

export class BulkImportProductsCommand {
  constructor(
    public readonly rows: BulkImportProductRow[],
    public readonly adminId: string,
  ) {}
}
