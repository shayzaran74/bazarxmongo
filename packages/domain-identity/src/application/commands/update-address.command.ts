import { Command } from '@barterborsa/shared-core';
import { UpdateAddressDto } from '../dtos/update-address.dto';

export class UpdateAddressCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly addressId: string,
    public readonly dto: UpdateAddressDto
  ) {
    super();
  }
}
