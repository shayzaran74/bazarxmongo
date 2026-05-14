import { IQueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './get-user.query';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { Result } from '@barterborsa/shared-core';
import { UserResponseDto } from '../dtos/user-response.dto';
export declare class GetUserHandler implements IQueryHandler<GetUserQuery, Result<UserResponseDto>> {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(query: GetUserQuery): Promise<Result<UserResponseDto>>;
}
