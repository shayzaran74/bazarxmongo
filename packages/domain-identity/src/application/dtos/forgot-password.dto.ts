import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Geçersiz e-posta adresi' })
  @IsNotEmpty({ message: 'E-posta zorunludur' })
  email!: string;
}
