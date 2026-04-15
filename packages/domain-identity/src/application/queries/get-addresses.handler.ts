import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAddressesQuery } from './get-addresses.query';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { Result, Ok } from '@barterborsa/shared-core';
import { AddressResponseDto } from '../dtos/address-response.dto';

@QueryHandler(GetAddressesQuery)
export class GetAddressesHandler implements IQueryHandler<GetAddressesQuery, Result<AddressResponseDto[]>> {
  constructor(
    @Inject('IUserAddressRepository') private readonly addressRepository: IUserAddressRepository
  ) {}

  async execute(query: GetAddressesQuery): Promise<Result<AddressResponseDto[]>> {
    const addresses = await this.addressRepository.findByUserId(query.userId);

    return Ok(addresses.map(addr => AddressResponseDto.fromEntity(addr)));
  }
}
