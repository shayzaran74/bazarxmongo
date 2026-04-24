// apps/backend/src/modules/commerce/application/dtos/checkout.dto.ts

import { IsString, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
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
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress?: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress?: AddressDto;

  @IsOptional()
  @IsString()
  addressId?: string;

  @IsString()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsBoolean()
  useWallet?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
