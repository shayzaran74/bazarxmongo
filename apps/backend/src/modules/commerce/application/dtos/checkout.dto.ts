// apps/backend/src/modules/commerce/application/dtos/checkout.dto.ts

import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsString() phone!: string;
  @IsString() addressLine1!: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsString() city!: string;
  @IsString() district!: string;
  @IsOptional() @IsString() neighborhood?: string;
  @IsString() postalCode!: string;
}

export class CheckoutDto {
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress!: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress!: AddressDto;

  @IsString()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
