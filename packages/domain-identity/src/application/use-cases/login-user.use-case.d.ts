import { IUseCase, Result } from '@barterborsa/shared-core';
import { LoginUserInput } from '@barterborsa/shared-types';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HashingService } from '@barterborsa/shared-security';
export declare class LoginUserUseCase implements IUseCase<LoginUserInput, Result<User>> {
    private readonly userRepository;
    private readonly hashingService;
    constructor(userRepository: IUserRepository, hashingService: HashingService);
    execute(input: LoginUserInput): Promise<Result<User>>;
}
