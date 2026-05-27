// apps/backend/src/modules/identity/infrastructure/auth/auth.service.ts

import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { CommandBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LoginUserCommand,
  IUserRepository,
  User,
  UserResponseDto,
} from '@barterborsa/domain-identity';
import { LoginUserInput } from '@barterborsa/shared-types';
import { TokenService } from './token.service';
import { IUser, ISession, SessionSchema } from '@barterborsa/shared-persistence';
import { IVerificationTokenRepository } from '@barterborsa/domain-identity';
import { MailService } from '../../../communication/infrastructure/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokenService: TokenService,
    @InjectModel('Session') private readonly sessionModel: Model<ISession>,
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private readonly mailService: MailService,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IVerificationTokenRepository') private readonly verificationTokenRepository: IVerificationTokenRepository,
  ) {}

  async login(input: LoginUserInput, userAgent?: string, ipAddress?: string) {
    const result = await this.commandBus.execute(new LoginUserCommand(input));
    if (!result.success) throw new UnauthorizedException(result.error.message);

    const user = result.data;

    // Sadece eski/şüpheli session'ları temizle — 30 günden eski veya aynı cihazda olmayanlar
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await this.sessionModel.deleteMany({
      userId: user.id,
      $or: [
        { lastActiveAt: { $lt: thirtyDaysAgo } },
        { createdAt: { $lt: thirtyDaysAgo } },
      ],
    });

    const tokens = await this.generateUserTokens(user);

    // Session oluşturma fire-and-forget — session storage down olsa bile token ver
    // Kullanıcı sonraki isteklerde auth başarısız olursa tekrar login yapmalı
    this.createSession(user.id, tokens.refreshToken, userAgent, ipAddress).catch(err => {
      this.logger.error(`Session creation failed for user ${user.id}: ${err.message}`);
    });

    return { user: UserResponseDto.fromEntity(user), ...tokens };
  }

  async googleLogin(
    googleProfile: { email: string; googleId: string; firstName?: string; lastName?: string },
    userAgent?: string,
    ipAddress?: string,
  ) {
    let user = await this.userRepository.findByEmail(googleProfile.email);

    if (!user) {
      const userResult = User.create({
        email:           googleProfile.email,
        googleId:        googleProfile.googleId,
        firstName:       googleProfile.firstName,
        lastName:        googleProfile.lastName,
        role:            'USER',
        status:          'ACTIVE',
        isEmailVerified: true,
        platform:        'BAZARX',
      });
      if (!userResult.success) throw new Error('Google kullanıcısı oluşturulamadı.');
      user = userResult.data;
      await this.userRepository.save(user);
    }

    const tokens = await this.generateUserTokens(user);
    this.createSession(user.id, tokens.refreshToken, userAgent, ipAddress).catch(err => {
      this.logger.error(`Google Session creation failed for user ${user.id}: ${err.message}`);
    });

    return { user: UserResponseDto.fromEntity(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      const user    = await this.userRepository.findById(payload.sub);

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Kullanıcı bulunamadı veya pasif.');
      }

      await this.tokenService.revokeRefreshToken(refreshToken);
      const tokens = await this.generateUserTokens(user);

      const oldHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const newHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');

      await this.sessionModel.updateMany(
        { userId: user.id, tokenHash: oldHash },
        { $set: { tokenHash: newHash, lastActiveAt: new Date() } },
      );

      return tokens;
    } catch (e: unknown) {
      this.logger.error(`Refresh failed: ${e instanceof Error ? e.message : 'unknown'}`);
      throw new UnauthorizedException('Refresh token geçersiz.');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await this.sessionModel.deleteMany({ userId, tokenHash });
      await this.tokenService.revokeRefreshToken(refreshToken);
    } else {
      await this.sessionModel.deleteMany({ userId });
    }
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı.');

    const verificationToken = await this.verificationTokenRepository.findByToken(code);
    if (!verificationToken || verificationToken.userId !== user.id || verificationToken.type !== 'EMAIL') {
      return { success: false, message: 'Geçersiz doğrulama kodu.' };
    }
    if (verificationToken.expiresAt < new Date()) {
      return { success: false, message: 'Doğrulama kodunun süresi dolmuş.' };
    }

    await this.userModel.updateOne(
      { _id: user.id },
      { $set: { isEmailVerified: true } },
    );
    await this.verificationTokenRepository.delete(verificationToken.id);

    return { success: true, message: 'E-posta başarıyla doğrulandı.' };
  }

  async resendVerification(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Kullanıcı bulunamadı.');

    await this.verificationTokenRepository.deleteByUserIdAndType(user.id, 'EMAIL');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const code = await this.verificationTokenRepository.create(user.id, 'EMAIL', expiresAt);
    await this.mailService.sendVerificationCode(email, code);

    return { success: true, message: 'Yeni doğrulama kodu gönderildi.' };
  }

  private async createSession(userId: string, refreshToken: string, userAgent?: string, ipAddress?: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const newId = new Types.ObjectId().toString();
    await this.sessionModel.create([{
      _id: newId, id: newId, userId, tokenHash,
      userAgent:    userAgent  || 'Unknown',
      ipAddress:    ipAddress  || 'Unknown',
      lastActiveAt: new Date(),
    }]);
  }

  private async generateUserTokens(user: User) {
    const accessToken = this.tokenService.generateAccessToken({
      id: user.id, email: user.email, role: user.role, platform: user.platform,
    });
    const refreshToken = this.tokenService.generateRefreshToken({
      id: user.id, email: user.email,
    });
    return { accessToken, refreshToken };
  }
}
