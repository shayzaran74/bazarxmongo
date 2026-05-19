import { ICommandHandler } from '@nestjs/cqrs';
import { LoginUserCommand } from './login-user.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HashingService } from '@barterborsa/shared-security';
import { Result } from '@barterborsa/shared-core';
import { User } from '../../domain/entities/user.entity';
export declare class LoginUserHandler implements ICommandHandler<LoginUserCommand, Result<User>> {
    private readonly userRepository;
    private readonly hashingService;
    constructor(userRepository: IUserRepository, hashingService: HashingService);
    execute(command: LoginUserCommand): Promise<Result<User>>;
}
