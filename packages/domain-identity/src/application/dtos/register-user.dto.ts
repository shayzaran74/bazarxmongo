import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'Geçersiz e-posta adresi' })
  @IsNotEmpty({ message: 'E-posta zorunludur' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  @IsNotEmpty({ message: 'Şifre zorunludur' })
  password!: string;

  @IsString()
  @IsOptional()          // ← Zorunluluk kaldırıldı
  firstName?: string;

  @IsString()
  @IsOptional()          // ← Zorunluluk kaldırıldı
  lastName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  referralCode?: string;

  @IsOptional()
  kvkkConsent?: boolean;

  @IsOptional()
  marketingConsent?: boolean;
}
