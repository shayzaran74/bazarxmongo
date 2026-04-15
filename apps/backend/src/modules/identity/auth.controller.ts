import { Controller, Post, Body, HttpException, HttpStatus, Req, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserDto, RegisterUserCommand, ForgotPasswordCommand, ResetPasswordCommand } from '@barterborsa/domain-identity';
import { AuthService } from './infrastructure/auth/auth.service';
import { Public } from '@barterborsa/shared-security';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const result = await this.commandBus.execute(new RegisterUserCommand(dto));
    
    if (!result.success) {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }

    return {
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu.',
      data: result.data,
    };
  }

  @Public()
  @Post('login')
  async login(@Body() input: any) {
    const authData = await this.authService.login(input);

    return {
      success: true,
      message: 'Giriş başarılı.',
      data: authData,
    };
  }

  @Public()
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const tokens = await this.authService.refresh(refreshToken);
    return {
      success: true,
      data: tokens
    };
  }

  @Post('logout')
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.id);
    return {
      success: true,
      message: 'Çıkış yapıldı.',
    };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: any) {
    await this.commandBus.execute(new ForgotPasswordCommand(dto));
    return {
      success: true,
      message: 'Eğer e-posta adresi kayıtlı ise bir bağlantı gönderilecektir.',
    };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: any) {
    const result = await this.commandBus.execute(new ResetPasswordCommand(dto));
    if (!result.success) {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }
    return {
      success: true,
      message: 'Şifreniz başarıyla sıfırlandı.',
    };
  }
}
