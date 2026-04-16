// apps/backend/src/modules/catalog/application/dtos/create-listing.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { ListingVisibility } from '../../domain/enums/listing-visibility.enum';
import { ProductCondition } from '../../domain/enums/product-condition.enum';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  catalogProductId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsNumber()
  @IsNotEmpty()
  stock!: number;

  @IsEnum(ListingVisibility)
  @IsOptional()
  visibility: ListingVisibility = ListingVisibility.PUBLIC;

  @IsEnum(ProductCondition)
  @IsOptional()
  condition: ProductCondition = ProductCondition.NEW;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsBoolean()
  @IsOptional()
  isDigital: boolean = false;

  @IsBoolean()
  @IsOptional()
  isB2BOnly: boolean = false;

  @IsArray()
  @IsOptional()
  tags: string[] = [];
}
