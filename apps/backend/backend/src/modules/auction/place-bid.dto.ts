import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class PlaceBidDto {
  @ApiProperty({ example: 100, description: 'Teklif tutarı' })
  @IsNumber()
  @Min(0.01)
  amount!: number;
}
