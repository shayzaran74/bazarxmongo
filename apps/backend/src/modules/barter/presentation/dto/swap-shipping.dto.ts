// apps/backend/src/modules/barter/presentation/dto/swap-shipping.dto.ts

import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwapShippingDto {
  @ApiProperty({ description: 'Kargo takip numarası', example: 'MNG-123456' })
  @IsString()
  @MinLength(3)
  trackingCode!: string;

  @ApiProperty({ description: 'Kargo firması', example: 'MNG Kargo' })
  @IsString()
  @MinLength(2)
  carrier!: string;
}
