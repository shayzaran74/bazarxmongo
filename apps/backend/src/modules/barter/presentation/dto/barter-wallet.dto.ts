// apps/backend/src/modules/barter/presentation/dto/barter-wallet.dto.ts

import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BarterTopupDto {
  @IsNumber() @Min(0.01) @Type(() => Number)
  amount!: number;
}

export class BarterWithdrawDto {
  @IsNumber() @Min(0.01) @Type(() => Number)
  amount!: number;
}

export class BarterTransferDto {
  @IsString() @IsNotEmpty()
  toCompanyId!: string;

  @IsNumber() @Min(0.01) @Type(() => Number)
  amount!: number;

  @IsOptional() @IsString()
  note?: string;
}
