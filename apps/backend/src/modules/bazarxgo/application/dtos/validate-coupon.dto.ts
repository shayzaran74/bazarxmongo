// apps/backend/src/modules/bazarxgo/application/dtos/validate-coupon.dto.ts

import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateGoCouponDto {
  @ApiProperty({ description: 'Kupon kodu' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'Sepet tutarı (string Decimal)' })
  @IsNumberString()
  orderAmount!: string;
}
