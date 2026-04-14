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

    // 2. Şifre doğrula (logic barterborsa'dan)
    const isPasswordValid = await this.hashingService.compare(input.password, user['props'].passwordHash);
    if (!isPasswordValid) {
      return Err(new Error('E-posta veya şifre hatalı.'));
    }

    // 3. Durum kontrolü
    if (user['props'].status === 'SUSPENDED') {
      return Err(new Error('Hesabınız askıya alınmıştır.'));
    }

    return Ok(user);
  }
}
