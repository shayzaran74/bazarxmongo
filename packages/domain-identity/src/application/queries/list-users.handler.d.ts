import { IQueryHandler } from '@nestjs/cqrs';
import { ListUsersQuery } from './list-users.query';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { Result } from '@barterborsa/shared-core';
import { UserResponseDto } from '../dtos/user-response.dto';
interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare class ListUsersHandler implements IQueryHandler<ListUsersQuery, Result<PaginatedResult<UserResponseDto>>> {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    execute(query: ListUsersQuery): Promise<Result<PaginatedResult<UserResponseDto>>>;
}
export {};
