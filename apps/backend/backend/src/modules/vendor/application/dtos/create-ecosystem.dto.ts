// apps/backend/src/modules/vendor/application/dtos/create-ecosystem.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateEcosystemDto {
  @ApiProperty({ example: 'Anadolu Gıda Ekosistemi', minLength: 2 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
