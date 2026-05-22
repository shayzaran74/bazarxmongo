// apps/backend/src/modules/catalog/application/commands/create-admin-product.command.ts

import { CreateCatalogProductDto } from '../dtos/create-catalog-product.dto';
import { CreateListingDto } from '../dtos/create-listing.dto';

export type CreateAdminProductData = Partial<CreateCatalogProductDto> &
  Partial<CreateListingDto> & {
    name?: string;
    title?: string;
    brandName?: string;
    brandId?: string;
    barcode?: string;
    isFeatured?: boolean;
    isSpecialOffer?: boolean;
    isFlashSale?: boolean;
  };

export class CreateAdminProductCommand {
  constructor(
    public readonly data: CreateAdminProductData,
    public readonly adminId: string
  ) {}
}
