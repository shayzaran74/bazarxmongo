import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserQuery } from './get-user.query';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { Result, Ok, Err, NotFoundException } from '@barterborsa/shared-core';
import { UserResponseDto } from '../dtos/user-response.dto';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, Result<UserResponseDto>> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository
  ) {}

  async execute(query: GetUserQuery): Promise<Result<UserResponseDto>> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) {
      return Err(new NotFoundException('Kullanıcı bulunamadı.'));
    }

    return Ok(UserResponseDto.fromEntity(user));
  }
}
