import { Command } from '@barterborsa/shared-core';
import { ChangePasswordDto } from '../dtos/change-password.dto';

export class ChangePasswordCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly dto: ChangePasswordDto
  ) {
    super();
  }
}
