// apps/backend/src/modules/commerce/application/dtos/add-to-cart.dto.ts

import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  listingId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  variantId?: string;
}
