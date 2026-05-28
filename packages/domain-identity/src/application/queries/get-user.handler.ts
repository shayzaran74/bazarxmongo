// packages/domain-identity/src/application/queries/get-user.handler.ts

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserQuery } from './get-user.query';
import { Result, Ok, Err, NotFoundException } from '@barterborsa/shared-core';
import type { IUserProjectionService } from '../../domain/services/user-projection.service.interface';
import type { UserFullDto } from '../dtos/user-full.dto';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, Result<UserFullDto>> {
  constructor(
    @Inject('IUserProjectionService')
    private readonly projectionService: IUserProjectionService,
  ) {}

  async execute(query: GetUserQuery): Promise<Result<UserFullDto>> {
    const profile = await this.projectionService.getFullProfile(query.userId);
    if (!profile) {
      return Err(new NotFoundException('Kullanıcı bulunamadı.'));
    }
    return Ok(profile);
  }
}
