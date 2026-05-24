// apps/backend/src/modules/catalog/application/dtos/create-catalog-product.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductAttributeDto {
  @IsString()
  name!: string;

  @IsString()
  value!: string;
}

export class CreateCatalogProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  gtin?: string;

  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  modelId?: string;

  @IsObject()
  @IsOptional()
  specs?: Record<string, string | number | boolean>;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];
}
