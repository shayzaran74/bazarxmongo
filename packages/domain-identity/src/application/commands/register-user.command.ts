import { Command } from '@barterborsa/shared-core';
import { RegisterUserDto } from '../dtos/register-user.dto';

export class RegisterUserCommand extends Command {
  constructor(public readonly dto: RegisterUserDto) {
    super();
  }
}
