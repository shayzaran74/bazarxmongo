import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoginUserCommand } from './login-user.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HashingService } from '@barterborsa/shared-security';
import { Result, Ok, Err, DomainException, UnauthorizedException } from '@barterborsa/shared-core';
import { User } from '../../domain/entities/user.entity';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand, Result<User>> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly hashingService: HashingService
  ) {}

  async execute(command: LoginUserCommand): Promise<Result<User>> {
    const { email, password } = command.dto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return Err(new UnauthorizedException('Geçersiz e-posta veya şifre.'));
    }

    // Lockout kontrolü — şifre denemesinden ÖNCE
    if (user.isLocked()) {
      const remainingMs = (user.lockoutUntil?.getTime() ?? 0) - Date.now();
      const remainingMin = Math.max(1, Math.ceil(remainingMs / 60000));
      return Err(new UnauthorizedException(
        `Çok fazla hatalı deneme. Hesabınız ${remainingMin} dakika içinde tekrar denenebilir.`
      ));
    }

    if (!user.passwordHash) {
      return Err(new UnauthorizedException('Bu hesap için şifre tanımlanmamış. Lütfen Google ile giriş yapın.'));
    }

    const isPasswordValid = await this.hashingService.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Hatalı şifre — sayacı artır, gerekirse kilitle
      user.recordFailedLogin();
      await this.userRepository.update(user);
      return Err(new UnauthorizedException('Geçersiz e-posta veya şifre.'));
    }

    if (user.status !== 'ACTIVE') {
      return Err(new DomainException('Hesabınız aktif değil. Durum: ' + user.status));
    }

    // Başarılı giriş — sayaç ve lockout sıfırlanır
    if (user.failedLoginCount > 0 || user.lockoutUntil) {
      user.clearFailedLogins();
      await this.userRepository.update(user);
    }

    return Ok(user);
  }
}
