// apps/backend/src/modules/vendor/application/commands/update-restaurant-settings.command.ts

import { Command } from '@barterborsa/shared-core';
import { UpdateRestaurantSettingsDto } from '../dtos/update-restaurant-settings.dto';

export class UpdateRestaurantSettingsCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly dto: UpdateRestaurantSettingsDto,
  ) {
    super();
  }
}
