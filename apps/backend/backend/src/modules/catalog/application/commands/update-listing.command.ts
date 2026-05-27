// apps/backend/src/modules/catalog/application/commands/update-listing.command.ts

import { CreateListingDto } from '../dtos/create-listing.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateListingDto extends PartialType(CreateListingDto) {}

export class UpdateListingCommand {
  constructor(
    public readonly userId: string,
    public readonly userRole: string | string[],
    public readonly id: string,
    public readonly dto: UpdateListingDto
  ) {}
}
