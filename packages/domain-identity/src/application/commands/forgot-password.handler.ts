import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ForgotPasswordCommand } from './forgot-password.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IVerificationTokenRepository } from '../../domain/repositories/verification-token.repository.interface';
import { Result, Ok, Err, DomainException, IEventBus } from '@barterborsa/shared-core';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand, Result<void>> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IVerificationTokenRepository') private readonly tokenRepository: IVerificationTokenRepository,
    @Inject('IEventBus') private readonly eventBus: IEventBus,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<Result<void>> {
    const { email } = command.dto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Güvenlik nedeniyle kullanıcı bulunamadığında da başarılı dönüyoruz (email enumeration engelleme)
      return Ok(undefined);
    }

    // Varsa eski tokenları temizle
    await this.tokenRepository.deleteByUserIdAndType(user.id, 'PASSWORD_RESET');

    // 1 saat geçerli token oluştur (6 haneli veya UUID olabilir, biz şimdilik random string/hex yapalım)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const token = await this.tokenRepository.create(user.id, 'PASSWORD_RESET', expiresAt);

    // Event fırlat (Email gönderimi için)
    this.eventBus.publish('auth.password_reset_requested', {
      userId: user.id,
      email: user.email,
      token: token,
    });

    return Ok(undefined);
  }
}
