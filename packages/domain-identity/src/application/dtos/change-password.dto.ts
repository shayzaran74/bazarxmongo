import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Mevcut şifre zorunludur' })
  currentPassword!: string;

  @IsString()
  @MinLength(6, { message: 'Yeni şifre en az 6 karakter olmalıdır' })
  @IsNotEmpty({ message: 'Yeni şifre zorunludur' })
  newPassword!: string;
}
