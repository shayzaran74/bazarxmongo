// apps/backend/src/modules/identity/auth.controller.ts

import { Controller, Post, Body, HttpException, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { RegisterUserInput, LoginUserInput } from '@barterborsa/shared-types';
import { RegisterUserUseCase } from '@barterborsa/domain-identity';
import { AuthService } from './infrastructure/auth/auth.service';
import { Public } from '@barterborsa/shared-security';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly authService: AuthService
  ) {}

  /**
   * Yeni kullanıcı kaydı.
   */
  @Public()
  @Post('register')
  async register(@Body() input: RegisterUserInput) {
    const result = await this.registerUseCase.execute(input);
    
    if (!result.success) {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }

    return {
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu.',
      data: {
        id: result.data.id,
        email: result.data.email,
        role: result.data.role,
      },
    };
  }

  /**
   * Standart giriş (E-posta + Şifre).
   * Başarılı ise Access ve Refresh token döner.
   */
  @Public()
  @Post('login')
  async login(@Body() input: LoginUserInput) {
    const authData = await this.authService.login(input);

    return {
      success: true,
      message: 'Giriş başarılı.',
      data: authData,
    };
  }

  /**
   * Çıkış işlemi (Blacklist kontrolü vb. burada tetiklenebilir).
   */
  @Post('logout')
  async logout() {
    return {
      success: true,
      message: 'Çıkış yapıldı.',
    };
  }
}
