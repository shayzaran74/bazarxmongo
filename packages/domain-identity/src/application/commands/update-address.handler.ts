import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateAddressCommand } from './update-address.command';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { Result, Ok, Err, NotFoundException } from '@barterborsa/shared-core';
import { AddressResponseDto } from '../dtos/address-response.dto';

@CommandHandler(UpdateAddressCommand)
export class UpdateAddressHandler implements ICommandHandler<UpdateAddressCommand, Result<AddressResponseDto>> {
  constructor(
    @Inject('IUserAddressRepository') private readonly addressRepository: IUserAddressRepository
  ) {}

  async execute(command: UpdateAddressCommand): Promise<Result<AddressResponseDto>> {
    const { userId, addressId, dto } = command;

    const address = await this.addressRepository.findById(addressId);

    if (!address || address.userId !== userId) {
      return Err(new NotFoundException('Adres bulunamadı.'));
    }

    address.update(dto);

    if (dto.isDefault) {
      await this.addressRepository.setDefault(addressId, userId);
    }

    await this.addressRepository.update(address);

    return Ok(AddressResponseDto.fromEntity(address));
  }
}
