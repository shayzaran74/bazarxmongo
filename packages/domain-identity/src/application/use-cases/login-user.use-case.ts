// packages/domain-identity/src/application/use-cases/login-user.use-case.ts

import { IUseCase, Result, Ok, Err } from '@barterborsa/shared-core';
import { LoginUserInput } from '@barterborsa/shared-types';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HashingService } from '@barterborsa/shared-security';

export class LoginUserUseCase implements IUseCase<LoginUserInput, Result<User>> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashingService: HashingService
  ) {}

  async execute(input: LoginUserInput): Promise<Result<User>> {
    // 1. Kullanıcıyı bul
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      return Err(new Error('E-posta veya şifre hatalı.'));
    }

    const props = (user as any).props;

    // 2. Şifre doğrula
    if (!props.passwordHash) {
      return Err(new Error('Bu hesap için şifre tanımlanmamış. Lütfen sosyal medya ile giriş yapın.'));
    }

    const isPasswordValid = await this.hashingService.compare(input.password, props.passwordHash);
    if (!isPasswordValid) {
      return Err(new Error('E-posta veya şifre hatalı.'));
    }

    // 3. Durum kontrolü
    if (user.status === 'SUSPENDED') {
      return Err(new Error('Hesabınız askıya alınmıştır.'));
    }

    return Ok(user);
  }
}
