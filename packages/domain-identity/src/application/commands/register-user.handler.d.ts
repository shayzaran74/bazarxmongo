import { ICommandHandler } from '@nestjs/cqrs';
import { RegisterUserCommand } from './register-user.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HashingService } from '@barterborsa/shared-security';
import { Result, IEventBus } from '@barterborsa/shared-core';
import { UserResponseDto } from '../dtos/user-response.dto';
export declare class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, Result<UserResponseDto>> {
    private readonly userRepository;
    private readonly verificationTokenRepository;
    private readonly hashingService;
    private readonly eventBus;
    constructor(userRepository: IUserRepository, verificationTokenRepository: any, hashingService: HashingService, eventBus: IEventBus);
    execute(command: RegisterUserCommand): Promise<Result<UserResponseDto>>;
}
