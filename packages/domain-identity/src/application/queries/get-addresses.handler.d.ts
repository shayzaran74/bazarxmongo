import { IQueryHandler } from '@nestjs/cqrs';
import { GetAddressesQuery } from './get-addresses.query';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { Result } from '@barterborsa/shared-core';
import { AddressResponseDto } from '../dtos/address-response.dto';
export declare class GetAddressesHandler implements IQueryHandler<GetAddressesQuery, Result<AddressResponseDto[]>> {
    private readonly addressRepository;
    constructor(addressRepository: IUserAddressRepository);
    execute(query: GetAddressesQuery): Promise<Result<AddressResponseDto[]>>;
}
