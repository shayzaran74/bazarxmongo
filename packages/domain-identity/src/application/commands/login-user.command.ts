import { Command } from '@barterborsa/shared-core';
import { LoginUserInput } from '@barterborsa/shared-types';

export class LoginUserCommand extends Command {
  constructor(public readonly dto: LoginUserInput) {
    super();
  }
}
