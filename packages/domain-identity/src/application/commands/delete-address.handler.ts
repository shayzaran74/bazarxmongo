import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteAddressCommand } from './delete-address.command';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { Result, Ok, Err, NotFoundException } from '@barterborsa/shared-core';

@CommandHandler(DeleteAddressCommand)
export class DeleteAddressHandler implements ICommandHandler<DeleteAddressCommand, Result<void>> {
  constructor(
    @Inject('IUserAddressRepository') private readonly addressRepository: IUserAddressRepository
  ) {}

  async execute(command: DeleteAddressCommand): Promise<Result<void>> {
    const { userId, addressId } = command;

    const address = await this.addressRepository.findById(addressId);

    if (!address || address.userId !== userId) {
      return Err(new NotFoundException('Adres bulunamadı.'));
    }

    await this.addressRepository.delete(addressId);

    return Ok(undefined);
  }
}
