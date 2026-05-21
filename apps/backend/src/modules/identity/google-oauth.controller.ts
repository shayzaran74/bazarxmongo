import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleAuthGuard } from './infrastructure/auth/google-auth.guard';
import { AuthService } from './infrastructure/auth/auth.service';
import { Public } from '@barterborsa/shared-security';

@ApiTags('Auth')
@Controller('auth/google')
export class GoogleOAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Initiate Google OAuth login', description: 'Kullanıcıyı Google giriş sayfasına yönlendirir.' })
  @ApiResponse({ status: 302, description: 'Google giriş sayfasına yönlendirme.' })
  @Get()
  @UseGuards(GoogleAuthGuard)
  async googleAuth(): Promise<void> {
    // GoogleAuthGuard bizi otomatik yönlendirir.
  }

  @Public()
  @ApiOperation({ summary: 'Google OAuth callback', description: 'Google giriş işlemi tamamlandıktan sonra dönülen endpoint. Başarılı girişte frontend\'e yönlendirir.' })
  @ApiResponse({ status: 302, description: 'Başarılı girişte frontend success sayfasına, hatada login sayfasına yönlendirir.' })
  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Record<string, unknown>, @Res() res: { redirect(url: string): void }) {
    const user = req.user as { email: string; googleId: string; firstName?: string; lastName?: string } | undefined;
    const userAgent = (req.headers as Record<string, string | undefined>)?.['user-agent'];
    const ip = req.connection as { remoteAddress?: string } | null | undefined;
    const ipAddress = (req as { ip?: string }).ip || ip?.remoteAddress || '';
    if (!user?.email || !user?.googleId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://192.168.1.102:3000'}/auth/login?error=invalid_user`);
    }
    const result = await this.authService.googleLogin(user, userAgent ?? '', ipAddress);
    
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
