import { Controller, Post, Body, HttpException, HttpStatus, Req, Res, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
  @ApiOperation({ summary: 'Refresh access token', description: 'Refresh token kullanarak yeni bir access token alır.' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' }
      },
      required: ['refreshToken']
    }
  })
  @ApiResponse({ status: 200, description: 'Token yenileme başarılı.' })
  @ApiResponse({ status: 401, description: 'Geçersiz veya süresi dolmuş refresh token.' })
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const tokens = await this.authService.refresh(refreshToken);
    return {
      success: true,
      data: tokens
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user', description: 'Kullanıcı oturumunu sonlandırır ve refresh token\'ı geçersiz kılar.' })
  @ApiResponse({ status: 200, description: 'Çıkış yapıldı.' })
  @Post('logout')
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.id);
    return {
      success: true,
      message: 'Çıkış yapıldı.',
    };
  }

  @Public()
  @ApiOperation({ summary: 'Request password reset link', description: 'Şifre sıfırlama bağlantısı talep eder.' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Bağlantı başarıyla gönderildi.' })
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
}
