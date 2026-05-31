// apps/backend/src/modules/bazarxgo/application/dtos/place-order.dto.ts

import { IsString, IsEnum, IsArray, IsOptional, ValidateNested, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoOrderMode } from '../../domain/enums/go-order-mode.enum';

export class GoOrderItemDto {
  @ApiProperty({ description: 'Menü item ID' })
  @IsString()
  @IsNotEmpty()
  menuItemId!: string;

  @ApiProperty({ description: 'Adet', minimum: 1 })
  @IsInt()
  @Min(1)
  qty!: number;
}

export class PlaceGoOrderDto {
  @ApiProperty({ description: 'Restoran ID' })
  @IsString()
  @IsNotEmpty()
  restaurantId!: string;

  @ApiProperty({ enum: GoOrderMode, description: 'Sipariş modu' })
  @IsEnum(GoOrderMode)
  mode!: GoOrderMode;

  @ApiProperty({ type: [GoOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoOrderItemDto)
  items!: GoOrderItemDto[];

  @ApiPropertyOptional({ description: 'Kupon kodu' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Teslimat adresi (mode=delivery için)' })
  @IsOptional()
  @IsString()
  addressLine?: string;
}
