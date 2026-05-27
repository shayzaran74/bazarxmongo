// apps/backend/src/modules/content/application/dtos/create-help.dtos.ts

import { IsString, IsOptional, IsInt, IsBoolean, IsEnum } from 'class-validator';
import { ArticleStatus } from '../../domain/enums/article-status.enum';

export class CreateHelpCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsOptional()
  order: number = 0;

  @IsString()
  @IsOptional()
  language: string = 'tr';

  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  platform: string = 'BAZARX';
}

export class CreateHelpArticleDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsEnum(ArticleStatus)
  @IsOptional()
  status: ArticleStatus = ArticleStatus.DRAFT;

  @IsInt()
  @IsOptional()
  order: number = 0;

  @IsString()
  @IsOptional()
  language: string = 'tr';

  @IsString()
  categoryId!: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;

  @IsBoolean()
  @IsOptional()
  isPopular: boolean = false;

  @IsString()
  @IsOptional()
  platform: string = 'BAZARX';
}
