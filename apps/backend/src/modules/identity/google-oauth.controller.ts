// apps/backend/src/modules/identity/google-oauth.controller.ts

import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleAuthGuard } from './infrastructure/auth/google-auth.guard';
import { AuthService } from './infrastructure/auth/auth.service';
import { Public } from '@barterborsa/shared-security';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth/google')
export class GoogleOAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Google giriş sayfasına yönlendirme.' })
  @Get()
  @UseGuards(GoogleAuthGuard)
  async googleAuth(): Promise<void> {
    // GoogleAuthGuard otomatik yönlendirir
  }

  @Public()
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Başarılı girişte frontend success sayfasına yönlendirir.' })
  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Record<string, unknown>, @Res() res: Response) {
    const user = req.user as { email: string; googleId: string; firstName?: string; lastName?: string } | undefined;
    const userAgent = (req.headers as Record<string, string | undefined>)?.['user-agent'];
    const ip = req.connection as { remoteAddress?: string } | null | undefined;
    const ipAddress = (req as { ip?: string }).ip || ip?.remoteAddress || '';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';

    if (!user?.email || !user?.googleId) {
      return res.redirect(`${frontendUrl}/auth/login?error=invalid_user`);
    }

    const result = await this.authService.googleLogin(user, userAgent ?? '', ipAddress);

    // Token'lar httpOnly cookie ile — URL parametresinde DEĞİL
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const url = new URL(`${frontendUrl}/auth/success`);
    url.searchParams.append('userId', result.user.id);
    url.searchParams.append('email', result.user.email);
    url.searchParams.append('role', result.user.role);

    return res.redirect(url.toString());
  }
}
