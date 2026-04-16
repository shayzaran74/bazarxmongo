// apps/backend/src/modules/vendor/application/dtos/register-vendor.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

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
}
