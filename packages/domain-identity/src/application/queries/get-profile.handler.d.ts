import { IQueryHandler } from '@nestjs/cqrs';
import { GetProfileQuery } from './get-profile.query';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { Result } from '@barterborsa/shared-core';
import { ProfileResponseDto } from '../dtos/profile-response.dto';
export declare class GetProfileHandler implements IQueryHandler<GetProfileQuery, Result<ProfileResponseDto>> {
    private readonly profileRepository;
    constructor(profileRepository: IUserProfileRepository);
    execute(query: GetProfileQuery): Promise<Result<ProfileResponseDto>>;
}
