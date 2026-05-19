import { ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from './change-password.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HashingService } from '@barterborsa/shared-security';
import { Result } from '@barterborsa/shared-core';
export declare class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand, Result<void>> {
    private readonly userRepository;
    private readonly hashingService;
    constructor(userRepository: IUserRepository, hashingService: HashingService);
    execute(command: ChangePasswordCommand): Promise<Result<void>>;
}
