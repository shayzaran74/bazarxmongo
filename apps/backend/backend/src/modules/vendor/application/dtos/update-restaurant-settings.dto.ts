// apps/backend/src/modules/vendor/application/dtos/update-restaurant-settings.dto.ts

import { IsBoolean, IsNumber, IsOptional, IsObject, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OpeningHoursDto } from './register-vendor.dto';

export class UpdateRestaurantSettingsDto {
  @IsBoolean()
  @IsOptional()
  holidayMode?: boolean;

  @IsBoolean()
  @IsOptional()
  acceptingOrders?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  deliveryRadius?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  avgPrepTimeMinutes?: number;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => OpeningHoursDto)
  openingHours?: OpeningHoursDto;
}
