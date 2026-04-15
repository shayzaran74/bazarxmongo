import { Command } from '@barterborsa/shared-core';

export class DeleteAddressCommand extends Command {
  constructor(
    public readonly userId: string,
    public readonly addressId: string
  ) {
    super();
  }
}
