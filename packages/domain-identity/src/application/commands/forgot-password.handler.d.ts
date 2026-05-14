import { ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from './forgot-password.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IVerificationTokenRepository } from '../../domain/repositories/verification-token.repository.interface';
import { Result, IEventBus } from '@barterborsa/shared-core';
export declare class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand, Result<void>> {
    private readonly userRepository;
    private readonly tokenRepository;
    private readonly eventBus;
    constructor(userRepository: IUserRepository, tokenRepository: IVerificationTokenRepository, eventBus: IEventBus);
    execute(command: ForgotPasswordCommand): Promise<Result<void>>;
}
