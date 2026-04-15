import { UserProfile } from '../../../domain/entities/user-profile.entity';
import { Prisma, UserProfile as PrismaUserProfile } from '@prisma/client';

export class UserProfileMapper {
  static toDomain(prismaProfile: PrismaUserProfile): UserProfile {
    return UserProfile.create({
      userId: prismaProfile.userId,
      firstName: prismaProfile.firstName || undefined,
      lastName: prismaProfile.lastName || undefined,
      avatar: prismaProfile.avatar || undefined,
      bio: prismaProfile.bio || undefined,
      birthday: prismaProfile.birthday || undefined,
      gender: prismaProfile.gender || undefined,
      city: prismaProfile.city || undefined,
      district: prismaProfile.district || undefined,
    }, prismaProfile.id);
  }

  static toPersistence(profile: UserProfile): Prisma.UserProfileUncheckedCreateInput {
    const props = profile.getProps();
    return {
      id: profile.id,
      userId: profile.userId,
      firstName: props.firstName,
      lastName: props.lastName,
      avatar: props.avatar,
      bio: props.bio,
      birthday: props.birthday,
      gender: props.gender,
      city: props.city,
      district: props.district,
    };
  }
}
