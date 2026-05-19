// packages/domain-identity/src/infrastructure/persistence/mappers/mongo-user-profile.mapper.ts
// UserProfile mapper — MongoDB document to domain entity (ADR-005 Faz 2c)

import { UserProfile } from '../../../domain/entities/user-profile.entity';

export class MongoUserProfileMapper {
  static toDomain(doc: any): UserProfile {
    return UserProfile.create({
      userId: doc.userId,
      firstName: doc.firstName,
      lastName: doc.lastName,
      avatar: doc.avatar,
      bio: doc.bio,
      birthday: doc.birthday,
      gender: doc.gender,
      phone: doc.phone,
      city: doc.city,
      district: doc.district,
      neighborhood: doc.neighborhood,
    }, doc.id);
  }

  static toPersistence(profile: UserProfile): any {
    const props = profile.getProps();
    return {
      id: profile.id,
      userId: props.userId,
      firstName: props.firstName,
      lastName: props.lastName,
      avatar: props.avatar,
      bio: props.bio,
      birthday: props.birthday,
      gender: props.gender,
      phone: props.phone,
      city: props.city,
      district: props.district,
      neighborhood: props.neighborhood,
    };
  }
}