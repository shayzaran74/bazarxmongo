// packages/domain-identity/src/infrastructure/auth/local.strategy.ts
// Passport-Local stratejisi — AuthGuard('local') ile kullanılır.
// validate() LoginUserCommand üzerinden şifre kontrolünü domain katmanına devreder.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../../application/commands/login-user.command';
import type { User } from '../../domain/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly commandBus: CommandBus) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string): Promise<User> {
    const result = await this.commandBus.execute(
      new LoginUserCommand({ email, password }),
    );
    if (!result.success) {
      throw new UnauthorizedException(result.error?.message || 'Giriş başarısız.');
    }
    return result.data as User;
  }
}
