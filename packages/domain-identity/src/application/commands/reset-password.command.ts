import { ResetPasswordDto } from '../dtos/reset-password.dto';

export class ResetPasswordCommand {
  constructor(public readonly dto: ResetPasswordDto) {}
}
