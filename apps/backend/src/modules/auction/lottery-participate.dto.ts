// apps/backend/src/modules/auction/lottery-participate.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class LotteryParticipateDto {
  @ApiProperty({ example: 1, minimum: 1, maximum: 10, description: 'Satın alınacak bilet sayısı' })
  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number = 1;
}
