import { Command } from '@barterborsa/shared-core';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

export class UpdateProfileCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly dto: UpdateProfileDto
  ) {
    super();
  }
}
