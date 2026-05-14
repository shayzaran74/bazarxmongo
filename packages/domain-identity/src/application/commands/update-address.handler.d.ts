import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateAddressCommand } from './update-address.command';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { Result } from '@barterborsa/shared-core';
import { AddressResponseDto } from '../dtos/address-response.dto';
export declare class UpdateAddressHandler implements ICommandHandler<UpdateAddressCommand, Result<AddressResponseDto>> {
    private readonly addressRepository;
    constructor(addressRepository: IUserAddressRepository);
    execute(command: UpdateAddressCommand): Promise<Result<AddressResponseDto>>;
}
