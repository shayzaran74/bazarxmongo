// apps/backend/src/modules/barter/application/dtos/surplus.dto.ts

import {
  IsString, IsNotEmpty, IsNumber, IsOptional,
  IsArray, IsObject, Min, IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PilotCity } from '../../domain/enums/pilot-city.enum';
import { SurplusStatus } from '../../domain/enums/surplus-status.enum';

export class SurplusCreateDto {
  @IsString() @IsNotEmpty()
  title!: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  categoryId?: string;

  @IsNumber() @Min(0) @Type(() => Number)
  quantity!: number;

  @IsString() @IsNotEmpty()
  unit!: string;

  @IsOptional() @IsEnum(PilotCity)
  city?: PilotCity;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  unitPrice?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  images?: string[];

  @IsOptional() @IsString()
  materialType?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  wantedCategories?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  tradeModes?: string[];

  @IsOptional() @IsObject()
  technicalSpecs?: Record<string, unknown>;
}

export class SurplusUpdateDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  categoryId?: string;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  quantity?: number;

  @IsOptional() @IsString()
  unit?: string;

  @IsOptional() @IsEnum(PilotCity)
  city?: PilotCity;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  unitPrice?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  images?: string[];

  @IsOptional() @IsString()
  materialType?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  wantedCategories?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  tradeModes?: string[];

  @IsOptional() @IsObject()
  technicalSpecs?: Record<string, unknown>;
}

// Sadece admin statü güncellemesi için
export class SurplusAdminStatusDto {
  @IsEnum(SurplusStatus)
  status!: SurplusStatus;
}

export class SurplusRejectDto {
  @IsString() @IsNotEmpty()
  reason!: string;
}

export class SurplusReactivateDto {
  @IsNumber() @Min(0.01) @Type(() => Number)
  quantity!: number;
}
