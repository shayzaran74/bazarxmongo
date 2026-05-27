// apps/backend/src/modules/vendor/application/commands/create-company.command.ts

import { Command } from '@barterborsa/shared-core';
import { CreateCompanyDto } from '../dtos/create-company.dto';

export class CreateCompanyCommand extends Command {
  constructor(public readonly dto: CreateCompanyDto) {
    super();
  }
}
