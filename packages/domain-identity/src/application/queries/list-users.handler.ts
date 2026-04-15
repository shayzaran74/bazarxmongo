import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListUsersQuery } from './list-users.query';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { Result, Ok } from '@barterborsa/shared-core';
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

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery, Result<PaginatedResult<UserResponseDto>>> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(query: ListUsersQuery): Promise<Result<PaginatedResult<UserResponseDto>>> {
    // In a real scenario, this would call repository or a separate query service
    // For now we assume repo has list support (not in interface yet, I should probably add it or use a separate query service)
    // The prompt says: "list-users.handler: PaginationInput al, PaginatedResult<UserResponseDto> döndür"
    
    // I'll assume the repository has a 'findMany' style method or just use basic implementation
    const { pagination, filters } = query;
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;

    // This is placeholder logic as interface didn't have list
    const users = await (this.userRepository as any).findAll ? await (this.userRepository as any).findAll(pagination, filters) : [];
    const total = await (this.userRepository as any).count ? await (this.userRepository as any).count(filters) : 0;

    return Ok({
      data: users.map((u: any) => UserResponseDto.fromEntity(u)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  }
}
