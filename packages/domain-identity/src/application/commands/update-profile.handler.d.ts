import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateProfileCommand } from './update-profile.command';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { Result } from '@barterborsa/shared-core';
import { ProfileResponseDto } from '../dtos/profile-response.dto';
export declare class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand, Result<ProfileResponseDto>> {
    private readonly profileRepository;
    constructor(profileRepository: IUserProfileRepository);
    execute(command: UpdateProfileCommand): Promise<Result<ProfileResponseDto>>;
}
