// apps/backend/src/modules/catalog/application/commands/create-listing.command.ts

import { Command } from '@barterborsa/shared-core';
import { CreateListingDto } from '../dtos/create-listing.dto';

export class CreateListingCommand extends Command {
  constructor(
    public readonly vendorId: string,
    public readonly dto: CreateListingDto
  ) {
    super();
  }
}
