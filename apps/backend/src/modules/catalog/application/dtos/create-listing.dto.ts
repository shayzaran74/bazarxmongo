// apps/backend/src/modules/catalog/application/dtos/create-listing.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean, IsArray, IsDateString, Min, ArrayMinSize, ValidateIf } from 'class-validator';
import { ListingVisibility } from '../../domain/enums/listing-visibility.enum';
import { ProductCondition } from '../../domain/enums/product-condition.enum';

// Master Plan v4.3 §4.2 — Fabrika ürün gamı bayi görünürlük türü
export enum DealerVisibility {
  ALL_DEALERS = 'ALL_DEALERS',
  SELECTED_DEALERS = 'SELECTED_DEALERS',
  NONE = 'NONE',
}

export class CreateListingDto {
  @IsString()
  @IsOptional()
  catalogProductId?: string;

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

  // Master Plan v4.3 §4.2 — Ekosistem (fabrika) bağlamı
  @IsString()
  @IsOptional()
  ecosystemId?: string;

  @IsEnum(DealerVisibility)
  @IsOptional()
  visibleTo: DealerVisibility = DealerVisibility.NONE;

  // SELECTED_DEALERS seçildiğinde en az 1 bayi olmalı
  @ValidateIf((o: CreateListingDto) => o.visibleTo === DealerVisibility.SELECTED_DEALERS)
  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  selectedDealerIds?: string[];

  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @IsDateString()
  @IsOptional()
  availableTo?: string;

  @IsBoolean()
  @IsOptional()
  allowOnlineResale: boolean = false;

  // Ekosistem listing'de zorunlu — Master Plan §4.2 (null olamaz)
  @ValidateIf((o: CreateListingDto) => !!o.ecosystemId)
  @IsNumber()
  @Min(1)
  maxOrderQtyPerDealer?: number;
}
