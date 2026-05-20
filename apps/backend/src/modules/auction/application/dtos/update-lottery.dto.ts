// apps/backend/src/modules/auction/application/dtos/update-lottery.dto.ts
import { IsString, IsNumber, IsOptional, IsDateString, IsPositive, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LotteryStatus } from '../../domain/enums/lottery-status.enum';

export class UpdateLotteryDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  prizeDescription?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  ticketPrice?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  totalTickets?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  maxTicketsPerUser?: number;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsEnum(LotteryStatus)
  @IsOptional()
  status?: LotteryStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  prizeValue?: number;
}
