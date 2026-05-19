import { ICommandHandler } from '@nestjs/cqrs';
import { AddAddressCommand } from './add-address.command';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { Result } from '@barterborsa/shared-core';
import { AddressResponseDto } from '../dtos/address-response.dto';
export declare class AddAddressHandler implements ICommandHandler<AddAddressCommand, Result<AddressResponseDto>> {
    private readonly addressRepository;
    constructor(addressRepository: IUserAddressRepository);
    execute(command: AddAddressCommand): Promise<Result<AddressResponseDto>>;
}
