import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AddAddressCommand } from './add-address.command';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { Result, Ok } from '@barterborsa/shared-core';
import { AddressResponseDto } from '../dtos/address-response.dto';
import { UserAddress } from '../../domain/entities/user-address.entity';

@CommandHandler(AddAddressCommand)
export class AddAddressHandler implements ICommandHandler<AddAddressCommand, Result<AddressResponseDto>> {
  constructor(
    @Inject('IUserAddressRepository') private readonly addressRepository: IUserAddressRepository
  ) {}

  async execute(command: AddAddressCommand): Promise<Result<AddressResponseDto>> {
    const { userId, dto } = command;

    const address = UserAddress.create({
      userId,
      ...dto
    });

    await this.addressRepository.save(address);

    if (address.isDefault) {
      await this.addressRepository.setDefault(address.id, userId);
    }

    return Ok(AddressResponseDto.fromEntity(address));
  }
}
