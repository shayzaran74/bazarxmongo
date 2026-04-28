// apps/backend/src/modules/auction/application/dtos/place-bid.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PlaceBidDto {
  @ApiProperty()
  auctionId!: string;
  @ApiProperty()
  amount!: number;
}
