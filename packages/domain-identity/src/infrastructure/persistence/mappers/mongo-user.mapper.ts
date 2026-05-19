// packages/domain-identity/src/infrastructure/persistence/mappers/mongo-user.mapper.ts
// User mapper — MongoDB document to domain entity (ADR-005 Faz 2c)

import { User } from '../../../domain/entities/user.entity';

export class MongoUserMapper {
  static toDomain(doc: any): User {
    const result = User.create({
      email: doc.email,
      phoneNumber: doc.phoneNumber || undefined,
      passwordHash: doc.password || undefined,
      role: doc.role,
      status: doc.status,
      platform: doc.platform || 'BAZARX',
      isEmailVerified: doc.isEmailVerified ?? false,
      googleId: doc.googleId || undefined,
      firstName: doc.firstName || doc.profile?.firstName || undefined,
      lastName: doc.lastName || doc.profile?.lastName || undefined,
      transactionPin: doc.transactionPin || undefined,
      lockoutUntil: doc.lockoutUntil || undefined,
      lastLoginAt: doc.lastLoginAt || undefined,
      lastSeenAt: doc.lastSeenAt || undefined,
      referredById: doc.referredById || undefined,
      deletedAt: doc.deletedAt || undefined,
      vendor: doc.vendor || undefined,
    }, doc.id);

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  static toPersistence(user: User): any {
    const props = user.getProps();
    return {
      id: user.id,
      email: user.email,
      phoneNumber: props.phoneNumber,
      password: props.passwordHash,
      transactionPin: props.transactionPin,
      role: user.role,
      status: user.status,
      platform: user.platform,
      isEmailVerified: props.isEmailVerified,
      googleId: props.googleId,
      lockoutUntil: props.lockoutUntil,
      lastLoginAt: props.lastLoginAt,
      lastSeenAt: props.lastSeenAt,
      referredById: props.referredById,
      deletedAt: props.deletedAt,
    };
  }
}