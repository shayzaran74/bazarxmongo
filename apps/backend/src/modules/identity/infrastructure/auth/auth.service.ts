import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { 
  LoginUserCommand, 
  IUserRepository, 
  User, 
  UserResponseDto 
} from '@barterborsa/domain-identity';
import { LoginUserInput } from '@barterborsa/shared-types';
import { TokenService } from './token.service';
import { PrismaService } from '@barterborsa/shared-persistence';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  /**
   * E-posta ve şifre ile giriş işlemi.
   */
  async login(input: LoginUserInput) {
    const result = await this.commandBus.execute(new LoginUserCommand(input));
    
    if (!result.success) {
      throw new UnauthorizedException(result.error.message);
    }

    const user = result.data;
    const tokens = await this.generateUserTokens(user);

    // Session kaydı oluştur
    await this.createSession(user.id);

    return {
      user: UserResponseDto.fromEntity(user),
      ...tokens,
    };
  }

  /**
   * Google OAuth ile giriş veya otomatik kayıt işlemi.
   */
  async googleLogin(googleProfile: { email: string; googleId: string; firstName?: string; lastName?: string }) {
    let user = await this.userRepository.findByEmail(googleProfile.email);

    if (!user) {
      const userResult = User.create({
        email: googleProfile.email,
        googleId: googleProfile.googleId,
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        role: 'USER',
        status: 'ACTIVE',
        isEmailVerified: true,
        platform: 'BAZARX',
      });

      if (!userResult.success) {
        throw new Error('Google kullanıcısı oluşturulamadı.');
      }

      user = userResult.data;
      await this.userRepository.save(user);
    }

    const tokens = await this.generateUserTokens(user);
    await this.createSession(user.id);

    return {
      user: UserResponseDto.fromEntity(user),
      ...tokens,
    };
  }

  /**
   * Refresh token ile yeni access token üretir.
   */
  async refresh(refreshToken: string) {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(payload.sub);
      
      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Kullanıcı bulunamadı veya pasif.');
      }

      // Old token'ı revoke et (rotation)
      await this.tokenService.revokeRefreshToken(refreshToken);

      const tokens = await this.generateUserTokens(user);
      return tokens;
    } catch (e: any) {
      this.logger.error(`Refresh failed: ${e.message}`);
      throw new UnauthorizedException('Refresh token geçersiz.');
    }
  }

  /**
   * Çıkış işlemi: Session silinir ve token blacklist'e eklenir.
   */
  async logout(userId: string, refreshToken?: string) {
    // Session'ları sil
    await this.prisma.session.deleteMany({ where: { userId } });
    
    // Refresh token'ı geçersiz kıl
    if (refreshToken) {
      await this.tokenService.revokeRefreshToken(refreshToken);
    }
  }

  private async createSession(userId: string): Promise<void> {
    await this.prisma.session.create({
      data: {
        userId,
        userAgent: 'Backend-Node', 
        ipAddress: '127.0.0.1',    
      },
    });
  }

  private async generateUserTokens(user: User) {
    const accessToken = await this.tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      platform: user.platform
    });

    const refreshToken = await this.tokenService.generateRefreshToken({
      id: user.id,
      email: user.email
    });

    return { accessToken, refreshToken };
  }
}
