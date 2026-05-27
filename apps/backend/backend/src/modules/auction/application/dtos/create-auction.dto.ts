// apps/backend/src/modules/auction/application/dtos/create-auction.dto.ts
import { IsString, IsNumber, IsOptional, IsDateString, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAuctionDto {
  @IsString()
  productId!: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  startPrice!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  minBidIncrement!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  participationDeposit?: number;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  endTime!: string;
}
