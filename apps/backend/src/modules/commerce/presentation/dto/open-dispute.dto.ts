// apps/backend/src/modules/commerce/presentation/dto/open-dispute.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsUrl } from 'class-validator';

export class OpenDisputeDto {
  @ApiProperty({ description: 'İtiraz nedeni', example: 'Ürün hasarlı geldi' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Detaylı açıklama' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Kanıt görselleri URL listesi', type: [String] })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  evidenceUrls?: string[];
}
