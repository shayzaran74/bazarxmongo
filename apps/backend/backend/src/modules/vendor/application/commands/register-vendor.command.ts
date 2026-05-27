// apps/backend/src/modules/vendor/application/commands/register-vendor.command.ts

import { Command } from '@barterborsa/shared-core';
import { RegisterVendorDto } from '../dtos/register-vendor.dto';

export class RegisterVendorCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly dto: RegisterVendorDto,
  ) {
    super();
  }
}
