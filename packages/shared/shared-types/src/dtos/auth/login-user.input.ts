// packages/shared/shared-types/src/dtos/auth/login-user.input.ts

import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserInput {
  @IsEmail({}, { message: 'Geçersiz e-posta adresi.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Şifre alanı zorunludur.' })
  password!: string;
}
