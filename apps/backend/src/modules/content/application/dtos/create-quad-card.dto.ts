// apps/backend/src/modules/content/application/dtos/create-quad-card.dto.ts

import { IsString, IsInt, IsBoolean, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuadCardItemDto {
  @IsString()
  title!: string;

  @IsString()
  image!: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsInt()
  order: number = 0;
}

export class CreateQuadCardDto {
  @IsString()
  title!: string;

  @IsInt()
  @IsOptional()
  order: number = 0;

  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;

  @IsString()
  @IsOptional()
  platform: string = 'BAZARX';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuadCardItemDto)
  items!: CreateQuadCardItemDto[];
}
