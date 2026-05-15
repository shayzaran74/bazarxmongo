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
      phone: (prismaProfile as any).phone || undefined,
      city: (prismaProfile as any).city || undefined,
      district: (prismaProfile as any).district || undefined,
      neighborhood: (prismaProfile as any).neighborhood || undefined,
    }, prismaProfile.id);
  }

  static toPersistence(profile: UserProfile): Prisma.UserProfileUncheckedCreateInput {
    const props = profile.getProps();
    const data: any = {
      id: profile.id,
      userId: profile.userId,
      firstName: props.firstName,
      lastName: props.lastName,
      avatar: props.avatar,
      bio: props.bio,
      birthday: props.birthday ? new Date(props.birthday) : null,
      gender: props.gender,
      phone: props.phone,
      city: props.city,
      district: props.district,
      neighborhood: props.neighborhood,
    };

    // undefined değerleri sil — Prisma'ya undefined göndermek sorun çıkarır
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) delete data[key];
    });

    return data;
  }
}
