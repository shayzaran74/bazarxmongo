// apps/backend/src/modules/vendor/application/dtos/update-ecosystem-settings.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateEcosystemSettingsDto {
  @ApiProperty({ required: false, description: 'Kör havuz modu (kimlik gizleme)' })
  @IsBoolean()
  @IsOptional()
  isBlindPool?: boolean;

  @ApiProperty({ required: false, minimum: 1, maximum: 20, description: 'Ekosistem içi komisyon oranı (%)' })
  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  internalCommRate?: number;
}
