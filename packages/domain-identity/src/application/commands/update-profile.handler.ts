import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { Result, Ok, Err, DomainException } from '@barterborsa/shared-core';
import { ProfileResponseDto } from '../dtos/profile-response.dto';
import { UserProfile } from '../../domain/entities/user-profile.entity';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand, Result<ProfileResponseDto>> {
  constructor(
    @Inject('IUserProfileRepository') private readonly profileRepository: IUserProfileRepository
  ) {}

  async execute(command: UpdateProfileCommand): Promise<Result<ProfileResponseDto>> {
    const { userId, dto } = command;

    let profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      profile = UserProfile.create({
        userId,
        ...dto
      });
      await this.profileRepository.save(profile);
    } else {
      profile.update(dto);
      await this.profileRepository.update(profile);
    }

    return Ok(ProfileResponseDto.fromEntity(profile));
  }
}
