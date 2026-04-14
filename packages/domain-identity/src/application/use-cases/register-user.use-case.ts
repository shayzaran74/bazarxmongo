// packages/domain-identity/src/application/use-cases/register-user.use-case.ts

import { IUseCase, Result, Ok, Err } from '@barterborsa/shared-core';
import { RegisterUserInput } from '@barterborsa/shared-types';
import { User, UserProps } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HashingService } from '@barterborsa/shared-security';

export class RegisterUserUseCase implements IUseCase<RegisterUserInput, Result<User>> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashingService: HashingService
  ) {}

  async execute(input: RegisterUserInput): Promise<Result<User>> {
    
    // 1. Email kontrolü
    const exists = await this.userRepository.exists(input.email);
    if (exists) {
      return Err(new Error('Bu e-posta adresi zaten kullanımda.'));
    }

    // 2. Şifre hashleme
    const passwordHash = await this.hashingService.hash(input.password);

    // 3. Entity oluşturma (Aggregate Root)
    const userProps: UserProps = {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      platform: input.platform || 'BAZARX',
      role: 'USER',
      status: 'ACTIVE', // Test aşamasında hızlı ilerlemek için ACTIVE yapalım
      isEmailVerified: false,
    };

    const userResult = User.create(userProps);
    if (!userResult.success) {
      return userResult;
    }

    const user = userResult.data;

    // 4. Kaydetme
    await this.userRepository.save(user);

    return Ok(user);
  }
}
