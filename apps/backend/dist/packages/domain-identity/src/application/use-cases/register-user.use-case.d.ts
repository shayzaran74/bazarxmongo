import { IUseCase, Result } from '@barterborsa/shared-core';
import { RegisterUserInput } from '@barterborsa/shared-types';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HashingService } from '@barterborsa/shared-security';
export declare class RegisterUserUseCase implements IUseCase<RegisterUserInput, Result<User>> {
    private readonly userRepository;
    private readonly hashingService;
    constructor(userRepository: IUserRepository, hashingService: HashingService);
    execute(input: RegisterUserInput): Promise<Result<User>>;
}
