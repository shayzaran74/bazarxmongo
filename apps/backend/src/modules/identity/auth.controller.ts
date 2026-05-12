import { Controller, Post, Body, HttpException, HttpStatus, Req, Res, Get, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { 
  RegisterUserDto, 
  RegisterUserCommand, 
  ForgotPasswordCommand, 
  ResetPasswordCommand,
  ForgotPasswordDto,
  ResetPasswordDto,
  GetUserQuery
} from '@barterborsa/domain-identity';
import { AuthService } from './infrastructure/auth/auth.service';
import { Public } from '@barterborsa/shared-security';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile', description: 'Oturum açmış kullanıcının bilgilerini döner.' })
  @ApiResponse({ status: 200, description: 'Kullanıcı bilgileri.' })
  @Get('me')
  async me(@Req() req: any) {
    return this.queryBus.execute(new GetUserQuery(req.user.id));
  }

  @Public()
  @ApiOperation({ summary: 'Register a new user', description: 'Yeni bir kullanıcı hesabı oluşturur.' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'Kullanıcı başarıyla oluşturuldu.' })
  @ApiResponse({ status: 400, description: 'Geçersiz veri veya e-posta zaten kullanımda.' })
  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Post('register')
  async register(@Body() dto: RegisterUserDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.commandBus.execute(new RegisterUserCommand(dto));

    if (!result.success) {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }

    const user = result.data;

    // httpOnly cookie'ye token'ları set et
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('access_token', user.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', user.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu.',
      data: { user: user.user },
    };
  }

  @Public()
  @ApiOperation({ summary: 'Login user', description: 'Kullanıcı girişi yapar ve JWT token döner.' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'Password123!' }
      },
      required: ['email', 'password']
    }
  })
  @ApiResponse({ status: 200, description: 'Giriş başarılı.' })
  @ApiResponse({ status: 401, description: 'Hatalı e-posta veya şifre.' })
  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(@Body() input: any, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const authData = await this.authService.login(input, userAgent, ipAddress);

    // httpOnly cookie'ye token'ları set et
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('access_token', authData.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 dakika
    });

    res.cookie('refresh_token', authData.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    return {
      success: true,
      message: 'Giriş başarılı.',
      data: { user: authData.user },
    };
  }

  @Public()
  @ApiOperation({ summary: 'Refresh access token', description: 'Refresh token kullanarak yeni bir access token alır.' })
  @ApiResponse({ status: 200, description: 'Token yenileme başarılı.' })
  @ApiResponse({ status: 401, description: 'Geçersiz veya süresi dolmuş refresh token.' })
  @Post('refresh')
  async refresh(
    @Req() req: any,
    @Body('refreshToken') bodyRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Önce cookie'den oku (httpOnly), yoksa body'den fallback (mobile / API client'lar için)
    const refreshToken = req.cookies?.refresh_token || bodyRefreshToken;
    if (!refreshToken) {
      throw new HttpException('Refresh token bulunamadı.', HttpStatus.UNAUTHORIZED);
    }

    const tokens = await this.authService.refresh(refreshToken);

    // Yeni token'ları httpOnly cookie'ye set et
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('access_token', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      data: tokens,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user', description: 'Kullanıcı oturumunu sonlandırır ve refresh token\'ı geçersiz kılar.' })
  @ApiResponse({ status: 200, description: 'Çıkış yapıldı.' })
  @Post('logout')
  async logout(
    @Req() req: any,
    @Body('refreshToken') bodyRefreshToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token || bodyRefreshToken;
    await this.authService.logout(req.user.id, refreshToken);

    // httpOnly cookie'leri temizle
    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
    res.clearCookie('access_token', clearOptions);
    res.clearCookie('refresh_token', clearOptions);

    return {
      success: true,
      message: 'Çıkış yapıldı.',
    };
  }

  @Public()
  @ApiOperation({ summary: 'Request password reset link', description: 'Şifre sıfırlama bağlantısı talep eder.' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Bağlantı başarıyla gönderildi.' })
  @Throttle({ auth: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: any) {
    await this.commandBus.execute(new ForgotPasswordCommand(dto));
    return {
      success: true,
      message: 'Eğer e-posta adresi kayıtlı ise bir bağlantı gönderilecektir.',
    };
  }

  @Public()
  @ApiOperation({ summary: 'Reset password', description: 'Şifre sıfırlama işlemini tamamlar.' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Şifre başarıyla sıfırlandı.' })
  @ApiResponse({ status: 400, description: 'Geçersiz veya süresi dolmuş token.' })
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

  @Public()
  @ApiOperation({ summary: 'Verify email with code', description: 'E-posta doğrulama kodunu kontrol eder.' })
  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; code: string }) {
    const result = await this.authService.verifyEmail(body.email, body.code);
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    return result;
  }

  @Public()
  @ApiOperation({ summary: 'Resend verification code', description: 'Doğrulama kodunu tekrar gönderir.' })
  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body.email);
  }
}
