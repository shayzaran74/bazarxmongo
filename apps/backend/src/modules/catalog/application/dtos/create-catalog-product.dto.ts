// apps/backend/src/modules/catalog/application/dtos/create-catalog-product.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

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
  specs?: any;

  @IsObject()
  @IsOptional()
  attributes?: any;
}
