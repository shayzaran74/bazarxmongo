import { ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from './reset-password.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IVerificationTokenRepository } from '../../domain/repositories/verification-token.repository.interface';
import { HashingService } from '@barterborsa/shared-security';
import { Result } from '@barterborsa/shared-core';
export declare class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand, Result<void>> {
    private readonly userRepository;
    private readonly tokenRepository;
    private readonly hashingService;
    constructor(userRepository: IUserRepository, tokenRepository: IVerificationTokenRepository, hashingService: HashingService);
    execute(command: ResetPasswordCommand): Promise<Result<void>>;
}
