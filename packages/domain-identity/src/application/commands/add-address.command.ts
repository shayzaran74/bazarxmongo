import { Command } from '@barterborsa/shared-core';
import { AddAddressDto } from '../dtos/add-address.dto';

export class AddAddressCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly dto: AddAddressDto
  ) {
    super();
  }
}
