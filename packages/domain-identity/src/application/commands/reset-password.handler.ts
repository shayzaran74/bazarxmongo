import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ResetPasswordCommand } from './reset-password.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IVerificationTokenRepository } from '../../domain/repositories/verification-token.repository.interface';
import { HashingService } from '@barterborsa/shared-security';
import { Result, Ok, Err, DomainException, NotFoundException } from '@barterborsa/shared-core';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand, Result<void>> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IVerificationTokenRepository') private readonly tokenRepository: IVerificationTokenRepository,
    private readonly hashingService: HashingService
  ) {}

  async execute(command: ResetPasswordCommand): Promise<Result<void>> {
    const { token, newPassword } = command.dto;

    // Tokenı bul
    const tokenResult = await this.tokenRepository.findByToken(token);
    if (!tokenResult || tokenResult.type !== 'PASSWORD_RESET') {
      return Err(new DomainException('Geçersiz veya süresi dolmuş token.'));
    }

    // Süre kontrolü
    if (new Date() > tokenResult.expiresAt) {
      await this.tokenRepository.delete(tokenResult.id);
      return Err(new DomainException('Token süresi dolmuş.'));
    }

    // Kullanıcıyı bul
    const user = await this.userRepository.findById(tokenResult.userId);
    if (!user) {
      return Err(new NotFoundException('Kullanıcı bulunamadı.'));
    }

    // Yeni şifreyi hashle ve kaydet
    const hashedPassword = await this.hashingService.hash(newPassword);
    
    // User entity içinde passwordHash güncelleme metodu olmalı veya direkt props üzerinden (shared-core AggregateRoot izin veriyorsa)
    // Şimdilik set-transaction-pin benzeri bir yaklaşımla:
    (user as any).props.passwordHash = hashedPassword;
    
    await this.userRepository.update(user);

    // Kullanılan tokenı sil
    await this.tokenRepository.delete(tokenResult.id);

    return Ok(undefined);
  }
}
