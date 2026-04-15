import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString() @IsNotEmpty() fullName!: string;
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @IsNotEmpty() addressLine1!: string;
  @IsString() @IsOptional() addressLine2?: string;
  @IsString() @IsNotEmpty() city!: string;
  @IsString() @IsNotEmpty() district!: string;
  @IsString() @IsOptional() neighborhood?: string;
  @IsString() @IsOptional() postalCode?: string;
}

class PackageInfoDto {
  @IsNumber() weight!: number;
  @IsNumber() width!: number;
  @IsNumber() height!: number;
  @IsNumber() depth!: number;
  @IsString() @IsOptional() description?: string;
}

export class CreateShipmentDto {
  @IsString() @IsNotEmpty() orderId!: string;
  @IsString() @IsNotEmpty() senderId!: string;
  @IsString() @IsNotEmpty() receiverId!: string;
  @IsString() @IsNotEmpty() vendorId!: string;
  @IsString() @IsNotEmpty() type!: 'ORDER'| 'BARTER' | 'RETURN';

  @IsObject() @ValidateNested() @Type(() => AddressDto)
  senderAddress!: AddressDto;

  @IsObject() @ValidateNested() @Type(() => AddressDto)
  receiverAddress!: AddressDto;

  @IsOptional() @IsObject() @ValidateNested() @Type(() => PackageInfoDto)
  packageInfo?: PackageInfoDto;
  
  @IsOptional() @IsString() barterSessionId?: string;
  @IsOptional() @IsNumber() barterPartNumber?: number;
}
