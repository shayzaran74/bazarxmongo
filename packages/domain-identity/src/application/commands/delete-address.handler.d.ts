import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteAddressCommand } from './delete-address.command';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { Result } from '@barterborsa/shared-core';
export declare class DeleteAddressHandler implements ICommandHandler<DeleteAddressCommand, Result<void>> {
    private readonly addressRepository;
    constructor(addressRepository: IUserAddressRepository);
    execute(command: DeleteAddressCommand): Promise<Result<void>>;
}
