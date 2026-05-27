// apps/backend/src/modules/auction/application/dtos/update-auction.dto.ts
import { IsString, IsNumber, IsOptional, IsDateString, IsPositive, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AuctionStatus } from '../../domain/enums/auction-status.enum';

export class UpdateAuctionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  startPrice?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  minBidIncrement?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  participationDeposit?: number;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsEnum(AuctionStatus)
  @IsOptional()
  status?: AuctionStatus;
}
