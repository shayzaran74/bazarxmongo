// apps/backend/src/modules/identity/auth.controller.ts

import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterUserInput, LoginUserInput } from '@barterborsa/shared-types';
import { RegisterUserUseCase, LoginUserUseCase } from '@barterborsa/domain-identity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase
  ) {}

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
        firstName: result.data.firstName,
        lastName: result.data.lastName,
      },
    };
  }

  @Post('login')
  async login(@Body() input: LoginUserInput) {
    const result = await this.loginUseCase.execute(input);

    if (!result.success) {
      throw new HttpException(result.error.message, HttpStatus.UNAUTHORIZED);
    }

    return {
      success: true,
      message: 'Giriş başarılı.',
      data: {
        id: result.data.id,
        email: result.data.email,
        role: result.data.role,
        firstName: result.data.firstName,
        lastName: result.data.lastName,
      },
    };
  }
}
