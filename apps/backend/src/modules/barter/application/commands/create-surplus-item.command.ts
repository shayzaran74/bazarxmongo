// apps/backend/src/modules/barter/application/commands/create-surplus-item.command.ts

import { Command } from '@barterborsa/shared-core';
import { PilotCity } from '../../domain/enums/pilot-city.enum';

export class CreateSurplusItemCommand extends Command {
  constructor(
    public readonly companyId: string,
    public readonly title: string,
    public readonly category: string,
    public readonly quantity: number | string,
    public readonly unit: string,
    public readonly city: PilotCity,
    public readonly description?: string,
    public readonly unitPrice?: number | string,
  ) {
    super();
  }
}
