// packages/shared/shared-types/src/dtos/auth/register-user.input.ts

import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterUserInput {
  @IsEmail({}, { message: 'Geçersiz e-posta adresi.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  password!: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
