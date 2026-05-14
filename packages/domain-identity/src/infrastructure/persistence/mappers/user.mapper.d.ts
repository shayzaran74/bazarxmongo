import { User } from '../../../domain/entities/user.entity';
import { Prisma, User as PrismaUser } from '@prisma/client';
export declare class UserMapper {
    static toDomain(prismaUser: ProntoPrismaUser): User;
    static toPersistence(user: User): Prisma.UserUncheckedCreateInput;
    static toProfilePersistence(user: User): Prisma.UserProfileUncheckedCreateInput;
}
type ProntoPrismaUser = PrismaUser & {
    profile?: any;
};
export {};
