import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProfileQuery } from './get-profile.query';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { Result, Ok, Err, NotFoundException } from '@barterborsa/shared-core';
import { ProfileResponseDto } from '../dtos/profile-response.dto';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery, Result<ProfileResponseDto>> {
  constructor(
    @Inject('IUserProfileRepository') private readonly profileRepository: IUserProfileRepository
  ) {}

  async execute(query: GetProfileQuery): Promise<Result<ProfileResponseDto>> {
    const profile = await this.profileRepository.findByUserId(query.userId);

    if (!profile) {
      return Err(new NotFoundException('Profil bulunamadı.'));
    }

    return Ok(ProfileResponseDto.fromEntity(profile));
  }
}
