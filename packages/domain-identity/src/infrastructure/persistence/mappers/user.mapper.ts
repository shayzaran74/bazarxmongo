import { User } from '../../../domain/entities/user.entity';
import { Prisma, User as PrismaUser } from '@prisma/client';

export class UserMapper {
  static toDomain(prismaUser: ProntoPrismaUser): User {
    // Note: ProntoPrismaUser is just a placeholder for full relations if needed
    // In many cases we just cast to PrismaUser
    const record = prismaUser as any;
    
    const userResult = User.create({
      email: record.email,
      phoneNumber: record.phoneNumber || undefined,
      passwordHash: record.password || undefined,
      role: record.role,
      status: record.status,
      platform: record.platform,
      isEmailVerified: record.isEmailVerified,
      googleId: record.googleId || undefined,
      firstName: record.profile?.firstName || undefined,
      lastName: record.profile?.lastName || undefined,
      transactionPin: record.transactionPin || undefined,
      lockoutUntil: record.lockoutUntil || undefined,
      lastLoginAt: record.lastLoginAt || undefined,
      lastSeenAt: record.lastSeenAt || undefined,
      deletedAt: record.deletedAt || undefined,
      referredById: record.referredById || undefined,
    }, record.id);

    if (!userResult.success) {
      throw userResult.error;
    }

    return userResult.data;
  }

  static toPersistence(user: User): Prisma.UserUncheckedCreateInput {
    const props = user.getProps();
    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: props.passwordHash,
      transactionPin: props.transactionPin,
      role: user.role as any, // Enum cast is fine
      status: user.status as any,
      platform: user.platform as any,
      isEmailVerified: props.isEmailVerified,
      googleId: props.googleId,
      lockoutUntil: props.lockoutUntil,
      lastLoginAt: props.lastLoginAt,
      lastSeenAt: props.lastSeenAt,
      deletedAt: props.deletedAt,
      referredById: props.referredById,
    };
  }

  static toProfilePersistence(user: User): Prisma.UserProfileUncheckedCreateInput {
    const props = user.getProps();
    return {
      userId: user.id,
      firstName: props.firstName,
      lastName: props.lastName,
    };
  }
}

type ProntoPrismaUser = PrismaUser & { profile?: any };
