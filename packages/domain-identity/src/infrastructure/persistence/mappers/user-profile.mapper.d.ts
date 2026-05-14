import { UserProfile } from '../../../domain/entities/user-profile.entity';
import { Prisma, UserProfile as PrismaUserProfile } from '@prisma/client';
export declare class UserProfileMapper {
    static toDomain(prismaProfile: PrismaUserProfile): UserProfile;
    static toPersistence(profile: UserProfile): Prisma.UserProfileUncheckedCreateInput;
}
