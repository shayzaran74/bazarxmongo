import { ForgotPasswordDto } from '../dtos/forgot-password.dto';

export class ForgotPasswordCommand {
  constructor(public readonly dto: ForgotPasswordDto) {}
}
