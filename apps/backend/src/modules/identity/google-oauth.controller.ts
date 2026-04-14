import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { GoogleAuthGuard } from './infrastructure/auth/google-auth.guard';
import { AuthService } from './infrastructure/auth/auth.service';
import { Public } from '@barterborsa/shared-security';

@Controller('auth/google')
export class GoogleOAuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Google girişini başlatır.
   */
  @Public()
  @Get()
  @UseGuards(GoogleAuthGuard)
  async googleAuth(): Promise<void> {
    // GoogleAuthGuard bizi otomatik yönlendirir.
  }

  /**
   * Google callback endpoint'i.
   */
  @Public()
  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const user = req.user;
    const result = await this.authService.googleLogin(user);
    
    // Frontend'e tokenları ve kullanıcı bilgilerini gönder
    const frontendUrl = process.env.FRONTEND_URL || 'http://192.168.1.102:3000';
    
    // AuthData içindeki user bilgilerini de ekleyelim
    const url = new URL(`${frontendUrl}/auth/success`);
    url.searchParams.append('accessToken', result.accessToken);
    url.searchParams.append('refreshToken', result.refreshToken);
    url.searchParams.append('userId', result.user.id);
    url.searchParams.append('email', result.user.email);
    url.searchParams.append('role', result.user.role);
    
    return res.redirect(url.toString());
  }
}
