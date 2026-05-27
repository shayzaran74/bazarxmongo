// apps/backend/src/modules/vendor/application/dtos/register-vendor.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsObject,
  IsNumber,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VendorType } from '../../domain/enums/vendor-type.enum';

// Restoran çalışma saati (her gün için open/close)
export class OpeningHoursDto {
  @IsObject() @IsOptional() monday?:    { open: string; close: string };
  @IsObject() @IsOptional() tuesday?:   { open: string; close: string };
  @IsObject() @IsOptional() wednesday?: { open: string; close: string };
  @IsObject() @IsOptional() thursday?:  { open: string; close: string };
  @IsObject() @IsOptional() friday?:    { open: string; close: string };
  @IsObject() @IsOptional() saturday?:  { open: string; close: string };
  @IsObject() @IsOptional() sunday?:    { open: string; close: string };
}

// Restoran-özel başvuru alanları (vendorType=RESTAURANT için)
export class RestaurantProfileDto {
  @IsString()  @IsOptional() cuisineType?: string;

  @IsNumber()  @IsOptional() @Min(0)
  deliveryRadius?: number;

  @IsNumber()  @IsOptional() @Min(0)
  minOrderAmount?: number;

  @IsNumber()  @IsOptional() @Min(1)
  avgPrepTimeMinutes?: number;

  @ValidateNested() @Type(() => OpeningHoursDto) @IsOptional()
  openingHours?: OpeningHoursDto;
}

export class RegisterVendorDto {
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsString()
  @IsNotEmpty()
  storeName!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsEmail()
  @IsOptional()
  supportEmail?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  // BazarX Go — Vendor tipi seçimi (varsayılan: COMMERCE)
  @IsEnum(VendorType)
  @IsOptional()
  vendorType?: VendorType;

  // RESTAURANT vendor için ek alanlar (diğer tipler için yok sayılır)
  @ValidateNested()
  @Type(() => RestaurantProfileDto)
  @IsOptional()
  restaurantProfile?: RestaurantProfileDto;
}
