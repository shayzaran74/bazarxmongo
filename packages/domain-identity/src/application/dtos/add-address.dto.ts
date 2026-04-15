import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Başlık zorunludur' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Ad zorunludur' })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Soyad zorunludur' })
  lastName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Telefon zorunludur' })
  phone!: string;

  @IsString()
  @IsNotEmpty({ message: 'Adres Satırı 1 zorunludur' })
  addressLine1!: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  @IsNotEmpty({ message: 'İl zorunludur' })
  city!: string;

  @IsString()
  @IsNotEmpty({ message: 'İlçe zorunludur' })
  district!: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
