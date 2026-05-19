import { ICommandHandler } from '@nestjs/cqrs';
import { SetTransactionPinCommand } from './set-transaction-pin.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { EncryptionService } from '@barterborsa/shared-security';
import { Result } from '@barterborsa/shared-core';
export declare class SetTransactionPinHandler implements ICommandHandler<SetTransactionPinCommand, Result<void>> {
    private readonly userRepository;
    private readonly encryptionService;
    constructor(userRepository: IUserRepository, encryptionService: EncryptionService);
    execute(command: SetTransactionPinCommand): Promise<Result<void>>;
}
