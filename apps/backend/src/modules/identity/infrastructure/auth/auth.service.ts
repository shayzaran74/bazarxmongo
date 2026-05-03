import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
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
import { IVerificationTokenRepository } from '@barterborsa/domain-identity';
import { MailService } from '../../../communication/infrastructure/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IVerificationTokenRepository') private readonly verificationTokenRepository: IVerificationTokenRepository,
  ) { }

  /**
   * E-posta ve şifre ile giriş işlemi.
   */
  async login(input: LoginUserInput, userAgent?: string, ipAddress?: string) {
    const result = await this.commandBus.execute(new LoginUserCommand(input));

    if (!result.success) {
      throw new UnauthorizedException(result.error.message);
    }

    const user = result.data;
    const tokens = await this.generateUserTokens(user);

    // Session kaydı oluştur (arka planda)
    this.createSession(user.id, tokens.refreshToken, userAgent, ipAddress).catch(err => {
      this.logger.error(`Session creation failed for user ${user.id}: ${err.message}`);
    });

    return {
      user: UserResponseDto.fromEntity(user),
      ...tokens,
    };
  }

  /**
   * Google OAuth ile giriş veya otomatik kayıt işlemi.
   */
  async googleLogin(
    googleProfile: { email: string; googleId: string; firstName?: string; lastName?: string },
    userAgent?: string,
    ipAddress?: string
  ) {
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
    // Session kaydı oluştur (arka planda)
    this.createSession(user.id, tokens.refreshToken, userAgent, ipAddress).catch(err => {
      this.logger.error(`Google Session creation failed for user ${user.id}: ${err.message}`);
    });

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

      // Session'ı yeni token ile güncelle
      const oldHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const newHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');

      await this.prisma.session.updateMany({
        where: { userId: user.id, tokenHash: oldHash },
        data: { tokenHash: newHash, lastActiveAt: new Date() }
      });

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
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      // Sadece bu cihazın session'ını sil
      await this.prisma.session.deleteMany({
        where: { userId, tokenHash }
      });

      // Refresh token'ı geçersiz kıl
      await this.tokenService.revokeRefreshToken(refreshToken);
    } else {
      // Token yoksa tüm session'ları sil (güvenlik amaçlı fallback)
      await this.prisma.session.deleteMany({ where: { userId } });
    }
  }

  private async createSession(userId: string, refreshToken: string, userAgent?: string, ipAddress?: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.session.create({
      data: {
        userId,
        tokenHash,
        userAgent: userAgent || 'Unknown',
        ipAddress: ipAddress || 'Unknown',
      },
    });
  }

  private async generateUserTokens(user: User) {
    const accessToken = this.tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      platform: user.platform
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      id: user.id,
      email: user.email
    });

    return { accessToken, refreshToken };
  }

  /**
   * E-posta doğrulama işlemi.
   */
  async verifyEmail(email: string, code: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }

    const verificationToken = await this.verificationTokenRepository.findByToken(code);
    
    if (!verificationToken || verificationToken.userId !== user.id || verificationToken.type !== 'EMAIL') {
      return { success: false, message: 'Geçersiz doğrulama kodu.' };
    }

    if (verificationToken.expiresAt < new Date()) {
      return { success: false, message: 'Doğrulama kodunun süresi dolmuş.' };
    }

    // Kullanıcıyı doğrulanmış olarak işaretle
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true }
    });

    // Token'ı sil
    await this.verificationTokenRepository.delete(verificationToken.id);

    return { success: true, message: 'E-posta başarıyla doğrulandı.' };
  }

  /**
   * Doğrulama kodunu tekrar gönder.
   */
  async resendVerification(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }

    // Eski token'ları sil
    await this.verificationTokenRepository.deleteByUserIdAndType(user.id, 'EMAIL');

    // Yeni token oluştur (15 dakika geçerli)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const code = await this.verificationTokenRepository.create(user.id, 'EMAIL', expiresAt);

    // Email gönder
    await this.mailService.sendVerificationCode(email, code);

    return { success: true, message: 'Yeni doğrulama kodu gönderildi.' };
  }
}
