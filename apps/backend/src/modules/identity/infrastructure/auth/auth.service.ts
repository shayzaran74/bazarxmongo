// apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts

import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { LoginUserUseCase, IUserRepository } from '@barterborsa/domain-identity';
import { LoginUserInput } from '@barterborsa/shared-types';
import { TokenService } from './token.service';
import { HashingService } from '@barterborsa/shared-security';
import { User } from '@barterborsa/domain-identity';
import { PrismaService } from '@barterborsa/shared-persistence';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
    private readonly prisma: PrismaService,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  /**
   * E-posta ve şifre ile giriş işlemi.
   */
  async login(input: LoginUserInput) {
    const result = await this.loginUserUseCase.execute(input);
    
    if (!result.success) {
      throw new UnauthorizedException(result.error.message);
    }

    const user = result.data;
    const tokens = await this.generateUserTokens(user);

    // Session kaydı oluştur
    await this.createSession(user.id);

    return {
      user: this.toResponseDto(user),
      ...tokens,
    };
  }

  /**
   * Google OAuth ile giriş veya otomatik kayıt işlemi.
   */
  async googleLogin(googleProfile: { email: string; googleId: string; firstName?: string; lastName?: string }) {
    let user = await this.userRepository.findByEmail(googleProfile.email);

    if (!user) {
      // Kullanıcı yoksa Google bilgileriyle oluştur (Şifresiz hesap)
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
    
    // Session kaydı oluştur
    await this.createSession(user.id);

    return {
      user: this.toResponseDto(user),
      ...tokens,
    };
  }

  /**
   * Kullanıcı için Session oluşturur (PostgreSQL).
   * Redis session mantığı TokenService/Blacklist üzerinden yürütülür.
   */
  private async createSession(userId: string): Promise<void> {
    await this.prisma.session.create({
      data: {
        userId,
        userAgent: 'Backend-Node', // İleride request'ten alınabilir
        ipAddress: '127.0.0.1',    // İleride request'ten alınabilir
      },
    });
  }

  /**
   * Kullanıcı için yeni token seti üretir.
   */
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

  /**
   * User entity'sini frontend'e dönecek güvenli bir nesneye çevirir.
   */
  private toResponseDto(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
