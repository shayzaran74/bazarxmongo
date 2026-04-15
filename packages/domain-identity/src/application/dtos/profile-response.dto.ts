import { UserProfile } from '../../domain/entities/user-profile.entity';

export class ProfileResponseDto {
  id!: string;
  userId!: string;
  firstName?: string;
  lastName?: string;
  fullName!: string;
  avatar?: string;
  bio?: string;
  city?: string;
  district?: string;

  static fromEntity(profile: UserProfile): ProfileResponseDto {
    const dto = new ProfileResponseDto();
    dto.id = profile.id;
    dto.userId = profile.userId;
    dto.firstName = profile.firstName;
    dto.lastName = profile.lastName;
    dto.fullName = profile.getFullName();
    dto.avatar = profile.avatar;
    dto.bio = profile.bio;
    dto.city = profile.city;
    dto.district = profile.district;
    return dto;
  }
}
