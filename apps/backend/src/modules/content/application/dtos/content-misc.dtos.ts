// apps/backend/src/modules/content/application/dtos/content-misc.dtos.ts

import { IsString, IsOptional, IsInt, IsBoolean, IsDateString, IsArray } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsString()
  @IsOptional()
  type: string = 'info';

  @IsInt()
  @IsOptional()
  priority: number = 0;

  @IsDateString()
  @IsOptional()
  startDate: string = new Date().toISOString();

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;

  @IsString()
  @IsOptional()
  linkText?: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsString()
  @IsOptional()
  targetPage?: string;
}

export class CreatePolicyDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsString()
  type!: string;

  @IsString()
  @IsOptional()
  version: string = '1.0';

  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;
}

export class CreateDynamicContentDto {
  @IsString()
  key!: string;

  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  contentType: string = 'text';

  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;
}

export class UpsertSeoMetadataDto {
  @IsString()
  path!: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords: string[] = [];

  @IsString()
  @IsOptional()
  ogImage?: string;

  @IsString()
  @IsOptional()
  platform: string = 'BAZARX';
}
