// apps/backend/src/modules/auction/application/dtos/draw-lottery.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DrawLotteryDto {
  @ApiProperty()
  lotteryId!: string;
}
