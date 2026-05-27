// apps/backend/src/modules/content/application/dtos/create-home-banner.dto.ts

import { IsString, IsOptional, IsInt, IsBoolean, IsUrl, IsDateString } from 'class-validator';

export class CreateHomeBannerDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  order: number = 0;

  @IsString()
  @IsOptional()
  buttonText?: string;

  @IsString()
  image!: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;

  @IsString()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  platform: string = 'BAZARX';

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
