import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DrawLotteryDto {
  @ApiProperty({ description: 'Çekiliş ID' })
  @IsString()
  @IsNotEmpty()
  lotteryId!: string;
}
