import { IsString, IsNumber, IsPositive, IsOptional, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class TopUpWalletDto {
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  amount!: number;

  @IsString()
  @MaxLength(50)
  paymentMethod!: string;
}

export class RequestWithdrawalDto {
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  amount!: number;

  @IsString()
  @MinLength(15)
  @MaxLength(34)
  iban!: string;

  @IsString()
  @MaxLength(200)
  accountHolder!: string;

  @IsString()
  @MaxLength(100)
  bankName!: string;
}

export class WalletQueryDto {
  @IsOptional()
  @IsString()
  accountType?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  user?: string;

  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;

  @IsOptional()
  @IsString()
  accountId?: string;
}

export class RejectWithdrawalDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}