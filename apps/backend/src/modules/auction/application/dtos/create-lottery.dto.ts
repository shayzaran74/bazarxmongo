// apps/backend/src/modules/auction/application/dtos/create-lottery.dto.ts
import { IsString, IsNumber, IsOptional, IsDateString, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLotteryDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  prizeDescription?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  ticketPrice!: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  totalTickets!: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxTicketsPerUser!: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  ticketDigits!: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  numbersPerTicket!: number;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsString()
  @IsOptional()
  listingId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  prizeValue?: number;
}
