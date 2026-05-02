// apps/backend/src/modules/barter/presentation/dto/swap-dispute.dto.ts

import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwapDisputeDto {
  @ApiProperty({ description: 'Anlaşmazlık açıklaması', example: 'Ürün hasarlı teslim edildi.' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  reason: string;
}
